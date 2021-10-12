# 🗃️ Immutable Item Store
[![npm version](https://badge.fury.io/js/immutable-item-store.svg)](https://badge.fury.io/js/immutable-item-store)
[![npm](https://img.shields.io/npm/dm/immutable-item-store.svg?maxAge=2592000)]()

> Store your items of data in a store powered by immutability


## Install

```
$ npm install immutable-item-store
```

## Usage
```ts
import { ItemStore }  from 'immutable-item-store';

// Declare your item class
class User {
  id = 'some-id';
  name = 'user name';
  isAdmin = false;
}

// Create an instance and pass item interface
const userStore = new ItemStore<User>();
const newUser = new User();

// Add new item
const { itemsDraft, patches, inversePatches, confirm } = userStore.add(newUser);
console.log('items size:', userStore.items.size); // items size: 0
console.log('items draft size:', itemsDraft.size); // items draft size: 1

confirm(); // or userStore.applyPatches(patches)
console.log('items size:', userStore.items.size); // items size: 1

userStore.applyPatches(inversePatches);
console.log('items size:', userStore.items.size); // items size: 0

// Update item
userStore.update('some-id', { isAdmin: true }).confirm();

// Batch update items
const updates: BatchUpdate<User>[] = [
  { id: 'some-id', itemProps: { name: 'user name 2' } },
  { id: 'some-id-2', itemProps: { name: 'user name 3', isAdmin: true } },
];
userStore.batchUpdate(updates).confirm();

// Remove item
userStore.remove('some-id').confirm();
```


### Advanced usage
```ts
import { ItemStore }  from 'immutable-item-store';

// Declare your item class
class User {
  id = 'id';
  name = 'user name';
  isAdmin = false;
}

class UserStore extends ItemStore<User> {
  public applyPatches(patches: Patch[]): User {
    const userId = patch.path[0] as string;
    const fieldName = patch.path[1];
    // Whenever user data changes we can identify what exactly has changed
    if (userId && fieldName) {
      console.log(`UserClient "${clientId}" changed "${fieldName}" to `, patch.value);
    } else if (clientId) {
      console.log(`UserClient "${clientId}" was ${patch.op}(e)d`);
    }

    // Do some data hanling (e.g. validation, emit event) and then apply the patches
    // if (validate(patches)) {
      const user = super.applyPatches(patches);
    // } else {
    //  throw new Error('Not valid');
    // }

    return user;
  }
}

const userStore = new UserStore();
const newUser = new User();

userStore.add(newUser).confirm();
const { itemsDraft, patches, inversePatches, confirm } = userStore.update(newUser.id, { name: 'new name' });
// Optimistic update
confirm();
api.users.create(newUser).catch((e) => {
  // If operation failed - reverse changes
  userStore.applyPatches(inversePatches);
});
```

## API

### .get(id: string)
Gets an item by id

### .add(id: string, item: ItemType)
Creates a draft of adding a new item to the store. [Returned value](https://github.com/MiroslavGannoha/immutable-item-store#returned-value).

### .update(id: string, itemProps: Partial<ItemType>)
Creates a draft of updating an item with new values. [Returned value](https://github.com/MiroslavGannoha/immutable-item-store#returned-value).

### .remove(id: string)
Creates a draft of removing an item from the store. [Returned value](https://github.com/MiroslavGannoha/immutable-item-store#returned-value).

### .batchUpdate(updates: [BatchUpdate](https://github.com/MiroslavGannoha/immutable-item-store/blob/main/src/index.ts#L24)<ItemType>[])
Creates a draft of batch updating items with new values. [Returned value](https://github.com/MiroslavGannoha/immutable-item-store#returned-value).

### .applyPatches(patches: [Patch](https://github.com/MiroslavGannoha/immutable-item-store#patch))
Applies patches to stored items. [More on patches.](https://immerjs.github.io/immer/patches/)

### .itemsArray()
Transforms map of items to an array when required

## Returned value
of add, update, remove, batchUpdate methods

```ts
type OpReturnType<T> = {
    itemsDraft: Items<Immutable<ItemType>>;
    patches: Patch[];
    inversePatches: Patch[];
    confirm: () => Items<ItemType>;
};
```
### itemsDraft
The draft of changes that were initiated

### patches
Describes changes that were initiated

### inversePatches
Describes inverse changes

### confirm
Saves the draft by appling patches

## Type tips

### Patch
```ts
interface Patch {
    op: "replace" | "remove" | "add";
    path: (string | number)[];
    value?: any;
}
```
