import { Patch, immerable } from 'immer';
import { BatchUpdate, ItemStore } from '../';

interface CustomItemProps {
  id: string;
  isMyItem: boolean;
  name: string;
  nested: {
    foo: string;
    boo: string;
  };
}

class CustomItem implements CustomItemProps {
  [immerable] = true;

  constructor(
    public id: string,
    public isMyItem: boolean,
    public name: string,
    public nested: {
      foo: string;
      boo: string;
    },
  ) {}
}

type TestProps = [
  string,
  boolean,
  string,
  {
    foo: string;
    boo: string;
  },
];

const testProps: TestProps = [
  'some-id',
  false,
  'some name',
  {
    boo: 'far',
    foo: 'bar',
  },
];

const testProps2: TestProps = [
  'some-id-2',
  false,
  'some name',
  {
    boo: 'far',
    foo: 'bar',
  },
];

const testItemPropsSnapshot = `
CustomItem {
  "id": "some-id",
  "isMyItem": false,
  "name": "some name",
  "nested": Object {
    "boo": "far",
    "foo": "bar",
  },
  Symbol(immer-draftable): true,
}
`;
const testItemMapSnapshot = `
Map {
  "some-id" => CustomItem {
    "id": "some-id",
    "isMyItem": false,
    "name": "some name",
    "nested": Object {
      "boo": "far",
      "foo": "bar",
    },
    Symbol(immer-draftable): true,
  },
}
`;

const update: Partial<CustomItemProps> = {
  isMyItem: true,
  nested: {
    boo: 'far',
    foo: 'bar 2',
  },
};

const testItemMapUpdatedSnapshot = `
Map {
  "some-id" => CustomItem {
    "id": "some-id",
    "isMyItem": true,
    "name": "some name",
    "nested": Object {
      "boo": "far",
      "foo": "bar 2",
    },
    Symbol(immer-draftable): true,
  },
}
`;

describe('Item store', () => {
  test('should init with 0 items', () => {
    const itemStore = new ItemStore<CustomItem>();
    expect(itemStore.items).toMatchInlineSnapshot(`Map {}`);
  });

  describe('".aplyPatches" method call', () => {
    test('should change current state with the patches', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      const patches: Patch[] = [
        { op: 'add', path: ['some-id'], value: customItem },
        { op: 'replace', path: ['some-id', 'isMyItem'], value: true },
        { op: 'replace', path: ['some-id', 'nested', 'foo'], value: 'bar 2' },
      ];
      itemStore.applyPatches(patches);
      expect(itemStore.items).toMatchInlineSnapshot(testItemMapUpdatedSnapshot);
    });
  });

  describe('".add" method call', () => {
    test('should produce new state draft', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      const { itemsDraft } = itemStore.add(customItem.id, customItem);
      expect(itemsDraft).toMatchInlineSnapshot(testItemMapSnapshot);
    });

    test('should not change current state', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(customItem.id, customItem);
      expect(itemStore.items).toMatchInlineSnapshot(`Map {}`);
    });

    test('should change current state on "confirm" call', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(customItem.id, customItem).confirm();
      expect(itemStore.items).toMatchInlineSnapshot(testItemMapSnapshot);
    });
  });

  describe('".get" method call', () => {
    test('tests getting an item', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(customItem.id, customItem).confirm();
      expect(itemStore.get(testProps[0])).toMatchInlineSnapshot(testItemPropsSnapshot);
    });
  });

  describe('".update" method call', () => {
    test('should produce new state draft', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(customItem.id, customItem).confirm();
      const { itemsDraft } = itemStore.update(customItem.id, update);
      expect(itemsDraft).toMatchInlineSnapshot(testItemMapUpdatedSnapshot);
    });

    test('should NOT change current state', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(customItem.id, customItem).confirm();
      itemStore.update(customItem.id, update);
      expect(itemStore.items).toMatchInlineSnapshot(testItemMapSnapshot);
    });

    test('should change current state on "confirm" call', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(customItem.id, customItem).confirm();
      itemStore.update(customItem.id, update).confirm();
      expect(itemStore.items).toMatchInlineSnapshot(testItemMapUpdatedSnapshot);
    });
  });

  describe('".remove" method call', () => {
    test('should produce new state draft', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(customItem.id, customItem).confirm();
      const { itemsDraft } = itemStore.remove(customItem.id);
      expect(itemsDraft).toMatchInlineSnapshot(`Map {}`);
    });

    test('should not change current state', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(customItem.id, customItem).confirm();
      itemStore.remove(customItem.id);
      expect(itemStore.items).toMatchInlineSnapshot(testItemMapSnapshot);
    });

    test('should change current state on "confirm" call', () => {
      const customItem = new CustomItem(...testProps);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(customItem.id, customItem).confirm();
      itemStore.remove(customItem.id).confirm();
      expect(itemStore.items).toMatchInlineSnapshot(`Map {}`);
    });
  });

  describe('".batchUpdate" method call', () => {
    const testitemsMapSnapshotBatch = `
      Map {
        "some-id" => CustomItem {
          "id": "some-id",
          "isMyItem": false,
          "name": "some name",
          "nested": Object {
            "boo": "far",
            "foo": "bar",
          },
          Symbol(immer-draftable): true,
        },
        "some-id-2" => CustomItem {
          "id": "some-id-2",
          "isMyItem": false,
          "name": "some name",
          "nested": Object {
            "boo": "far",
            "foo": "bar",
          },
          Symbol(immer-draftable): true,
        },
      }
    `;

    const testitemsMapUpdatedSnapshotBatch = `
      Map {
        "some-id" => CustomItem {
          "id": "some-id",
          "isMyItem": true,
          "name": "some name",
          "nested": Object {
            "boo": "far",
            "foo": "bar",
          },
          Symbol(immer-draftable): true,
        },
        "some-id-2" => CustomItem {
          "id": "some-id-2",
          "isMyItem": false,
          "name": "some name 3",
          "nested": Object {
            "boo": "far",
            "foo": "bar",
          },
          Symbol(immer-draftable): true,
        },
      }
    `;
    const itemId2 = 'some-id-2';

    const updates: BatchUpdate<CustomItem>[] = [
      { id: testProps[0], itemProps: { isMyItem: true } },
      { id: itemId2, itemProps: { name: 'some name 3' } },
    ];

    test('should produce new state draft', () => {
      const item1 = new CustomItem(...testProps);
      const item2 = new CustomItem(...testProps2);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(item1.id, item1).confirm();
      itemStore.add(item2.id, item2).confirm();

      const { itemsDraft } = itemStore.batchUpdate(updates);
      expect(itemsDraft).toMatchInlineSnapshot(testitemsMapUpdatedSnapshotBatch);
    });

    test('should NOT change current state w/o confirm call', () => {
      const item1 = new CustomItem(...testProps);
      const item2 = new CustomItem(...testProps2);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(item1.id, item1).confirm();
      itemStore.add(item2.id, item2).confirm();
      itemStore.batchUpdate(updates);
      expect(itemStore.items).toMatchInlineSnapshot(testitemsMapSnapshotBatch);
    });

    test('should change current state on "confirm" call', () => {
      const item1 = new CustomItem(...testProps);
      const item2 = new CustomItem(...testProps2);
      const itemStore = new ItemStore<CustomItem>();
      itemStore.add(item1.id, item1).confirm();
      itemStore.add(item2.id, item2).confirm();
      itemStore.batchUpdate(updates).confirm();
      expect(itemStore.items).toMatchInlineSnapshot(testitemsMapUpdatedSnapshotBatch);
    });
  });

  test('tests items array transofrmation', () => {
    const itemId2 = 'some-id-2';
    const item1 = new CustomItem(...testProps);
    const item2 = new CustomItem(...testProps2);
    const itemStore = new ItemStore<CustomItem>();
    itemStore.add(item1.id, item1).confirm();
    itemStore.add(item2.id, item2).confirm();
    expect(itemStore.itemsArray).toEqual([item1, item2]);
  });

  test('throws an error on item data edit', () => {
    const customItem = new CustomItem(...testProps);
    const itemStore = new ItemStore<CustomItem>();
    itemStore.add(customItem.id, customItem).confirm();
    const item = itemStore.get(customItem.id);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => item && (item.isMyItem = true)).toThrowErrorMatchingInlineSnapshot(
      `"Cannot assign to read only property 'isMyItem' of object '#<CustomItem>'"`,
    );
  });

  test('throws an error on items map add call', () => {
    const item1 = new CustomItem(...testProps);
    const item2 = new CustomItem(...testProps2);
    const itemStore = new ItemStore<CustomItem>();
    itemStore.add(item1.id, item1).confirm();

    expect(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      itemStore.items.set(item2.id, item2),
    ).toThrowErrorMatchingInlineSnapshot(
      `"[Immer] This object has been frozen and should not be mutated"`,
    );
  });

  test('throws an error on items map delete call', () => {
    const customItem = new CustomItem(...testProps);
    const itemStore = new ItemStore<CustomItem>();
    itemStore.add(customItem.id, customItem).confirm();

    expect(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      itemStore.items.delete(customItem.id),
    ).toThrowErrorMatchingInlineSnapshot(
      `"[Immer] This object has been frozen and should not be mutated"`,
    );
  });
});