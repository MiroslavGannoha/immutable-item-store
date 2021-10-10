import {
    applyPatches,
    enableMapSet,
    enablePatches,
    immerable,
    Patch,
    produceWithPatches,
    Immutable,
    Draft,
  } from 'immer';
  
  enablePatches();
  enableMapSet();

  export type Items<T> = ReadonlyMap<string, Immutable<T>>;

  type OpReturnType<T> = {
    itemsDraft: Items<Immutable<T>>;
    patches: Patch[];
    inversePatches: Patch[];
    confirm: () => Items<T>;
  };

  export interface BatchUpdate<T> {
    id: string;
    itemProps: Partial<T>;
  }
  
  export class ItemStore<T> {
    [immerable] = true;
    public items: Items<T> = new Map();
  
    /**
     * Returned on add/update/remove/batchUpdate operations and allows to save the changes to the store
     * @param patches - patches array
     * @returns updated items map
     */
    private confirm = (patches: Patch[]): Items<T> => {
      this.applyPatches(patches);
      return this.items;
    };
  
    // Operation methods
  
    /**
     * Gets an item by id
     * @param id - string
     * @returns item or null
     */
    public get(id: string): Immutable<T> | null {
      return this.items.get(id) || null;
    }
  
    /**
     * Creates a draft of adding a new item to the store
     * @param id - string
     * @param item - your predefined item type
     * @returns itemsDraft (the draft), patches (describes what changed), inversePatches (describes inverse changes), confirm (saves items draft by appling patches)
     */
    public add(id: string, item: Draft<Immutable<T>>): OpReturnType<T> {
      const [items, patches, inversePatches] = produceWithPatches(this.items, draft => {
        draft.set(id, item);
      });
      return {
        itemsDraft: items,
        patches,
        inversePatches,
        confirm: () => this.confirm(patches),
      };
    }
  
    /**
     * Creates a draft of updating an item with new values
     * @param id - string
     * @param itemProps - your predefined item type (could be partial)
     * @returns itemsDraft (the draft), patches (describes what changed), inversePatches (describes inverse changes), confirm (saves items draft by appling patches)
     */
    public update(id: string, itemProps: Partial<T>): OpReturnType<T> {
      const [items, patches, inversePatches] = produceWithPatches(this.items, draft => {
        const client = draft.get(id);
        if (client) {
          Object.assign(client, itemProps);
        }
      });
  
      return {
        itemsDraft: items,
        patches,
        inversePatches,
        confirm: () => this.confirm(patches),
      };
    }
  
    /**
     * Creates a draft of removing an item from the store
     * @param id - string
     * @returns itemsDraft (the draft), patches (describes what changed), inversePatches (describes inverse changes), confirm (saves items draft by appling patches)
     */
    public remove(id: string): OpReturnType<T> {
      const [items, patches, inversePatches] = produceWithPatches(this.items, draft => {
        draft.delete(id);
      });
  
      return {
        itemsDraft: items,
        patches,
        inversePatches,
        confirm: () => this.confirm(patches),
      };
    }
  
    /**
     * Creates a draft of batch updating items with new values
     * @param updates - id: strings, itemProps: item type (partial)
     * @returns itemsDraft (the draft), patches (describes what changed), inversePatches (describes inverse changes), confirm (saves items draft by appling patches)
     */
    public batchUpdate(updates: BatchUpdate<T>[]): OpReturnType<T> {
      const [items, patches, inversePatches] = produceWithPatches(this.items, draft => {
        updates.forEach(({ id, itemProps }) => {
          const client = draft.get(id);
          if (client) {
            Object.assign(client, itemProps);
          }
        });
      });
  
      return {
        itemsDraft: items,
        patches,
        inversePatches,
        confirm: () => this.confirm(patches),
      };
    }
  
    /**
     * Applies patches to the store items
     * @param patches - patches array
     * @returns updated items map
     */
    public applyPatches(patches: Patch[]): Items<T> {
      this.items = applyPatches(this.items, patches);
  
      return this.items;
    }
  
    /**
     * Transforms map of items to an array when required
     * @returns array of items
     */
    public get itemsArray(): Immutable<T>[] {
      return Array.from(this.items.values());
    }
  }
  