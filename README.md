# 🗃️ Immutable Item Store
[![NPM version](https://badge.fury.io/js/breeze-event-emitter.svg)](http://badge.fury.io/js/breeze-event-emitter)
[![npm](https://img.shields.io/npm/dm/breeze-event-emitter.svg?maxAge=2592000)]()

> Store your items of data in a store powered by immutability


## Install

```
$ npm install immutable-item-store
```

## Usage
### Typescript
```ts
import { ItemStore }  from 'immutable-item-store';

// Declare your item class
class User {
  id = 'id';
  name = 'user name';
  isAdmin = false;
}

// Create an instance and pass item interface
const userStore = new ItemStore<User>();

const newUser = new User();
const { itemsDraft, patches, inversePatches, confirm } = userStore.add(newUser);
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

### .batchUpdate(updates: [BatchUpdate](https://github.com/MiroslavGannoha/immutable-item-store/blob/main/src/index.ts#L22)<ItemType>[])
Creates a draft of batch updating items with new values. [Returned value](https://github.com/MiroslavGannoha/immutable-item-store#returned-value).

### .applyPatches(patches: [Patch](https://github.com/MiroslavGannoha/immutable-item-store#patch))
Applies patches to the store items. [More on patches.](https://immerjs.github.io/immer/patches/)

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