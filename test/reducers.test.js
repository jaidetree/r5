import * as reducers from "lib/reducers"
import { expectEqual } from "test/lib/util"

describe("Reducers", () => {
  describe(".set", () => {
    test("it should replace state", () => {
      const state = { a: 1 }
      const action = { data: { b: 2 } }

      expectEqual(reducers.set(state, action), {
        b: 2,
      })
    })
  })

  describe(".merge", () => {
    test("it should merge data into state", () => {
      const state = { a: 1, b: { c: 2 } }
      const action = { data: { b: { d: 3 } } }

      expectEqual(reducers.merge(state, action), {
        a: 1,
        b: { d: 3 },
      })
    })
  })

  describe(".mergeDeep", () => {
    test("it should merge data deeply into state", () => {
      const state = { a: 1, b: { c: 2 } }
      const action = { data: { b: { d: 3 } } }

      expectEqual(reducers.mergeDeep(state, action), {
        a: 1,
        b: { c: 2, d: 3 },
      })
    })
  })

  describe(".replaceByKey", () => {
    test("it should replace an item in collection", () => {
      const state = [ { a: 1, b: 2 }, { a: 10, b: 3 } ]
      const action = { data: { a: 1, c: 3 } }

      expectEqual(reducers.replaceByKey("a")(state, action), [
        { a: 1, c: 3 },
        { a: 10, b: 3 },
      ])
    })
  })

  describe(".replaceById", () => {
    test("it should replace an item in collection", () => {
      const state = [ { id: 1, a: 1 }, { id: 2, a: 2 } ]
      const action = { data: { id: 1, b: 2 } }

      expectEqual(reducers.replaceById(state, action), [
        { id: 1, b: 2 },
        { id: 2, a: 2 },
      ])
    })
  })

  describe(".mergeByKey", () => {
    test("it should merge an item in collection", () => {
      const state = [ { a: 1, b: 2 }, { a: 10, b: 3 } ]
      const action = { data: { a: 1, c: 3 } }

      expectEqual(reducers.mergeByKey("a")(state, action), [
        { a: 1, b: 2, c: 3 },
        { a: 10, b: 3 },
      ])
    })
  })

  describe(".mergeById", () => {
    test("it should merge an item in collection", () => {
      const state = [ { id: 1, a: 1 }, { id: 2, a: 2 } ]
      const action = { data: { id: 1, b: 2 } }

      expectEqual(reducers.mergeById(state, action), [
        { id: 1, a: 1, b: 2 },
        { id: 2, a: 2 },
      ])
    })
  })

  describe(".mergeDeepByKey", () => {
    test("it should deeply merge an item in collection", () => {
      const state = [ { a: 1, b: 2 }, { a: 10, b: 3 } ]
      const action = { data: { a: 1, c: 3 } }

      expectEqual(reducers.mergeDeepByKey("a")(state, action), [
        { a: 1, b: 2, c: 3 },
        { a: 10, b: 3 },
      ])
    })
  })

  describe(".mergeDeepById", () => {
    test("it should deeply merge an item in collection", () => {
      const state = [ { id: 1, a: 1 }, { id: 2, a: 2 } ]
      const action = { data: { id: 1, b: 2 } }

      expectEqual(reducers.mergeDeepById(state, action), [
        { id: 1, a: 1, b: 2 },
        { id: 2, a: 2 },
      ])
    })
  })

  describe(".remove", () => {
    test("it should remove an item from a collection", () => {
      const state =  [1, 2, 3]
      const action = { data: 2 }

      expectEqual(reducers.remove(state, action), [
        1,
        3,
      ])
    })
  })

  describe(".removeByKey", () => {
    test("it should remove an item from a collection with data object", () => {
      const state = [ { id: 1, a: 1 }, { id: 2, a: 2 } ]
      const action = { data: { a: 1 } }

      expectEqual(reducers.removeByKey("a")(state, action), [
        { id: 2, a: 2 },
      ])
    })

    test("it should remove an item from a collection with data value", () => {
      const state = [ { id: 1, a: 1 }, { id: 2, a: 2 } ]
      const action = { data: 1 }

      expectEqual(reducers.removeByKey("a")(state, action), [
        { id: 2, a: 2 },
      ])
    })

    test("it should remove an item from a collection with action key", () => {
      const state = [ { id: 1, a: 1 }, { id: 2, a: 2 } ]
      const action = { a: 1, data: { } }

      expectEqual(reducers.removeByKey("a")(state, action), [
        { id: 2, a: 2 },
      ])
    })
  })

  describe(".removeById", () => {
    test("it should remove an item from a collection with data object", () => {
      const state = [ { id: 1, a: 1 }, { id: 2, a: 2 } ]
      const action = { data: { id: 1 } }

      expectEqual(reducers.removeById(state, action), [
        { id: 2, a: 2 },
      ])
    })

    test("it should remove an item from a collection with data value", () => {
      const state = [ { id: 1, a: 1 }, { id: 2, a: 2 } ]
      const action = { data: 1 }

      expectEqual(reducers.removeById(state, action), [
        { id: 2, a: 2 },
      ])
    })

    test("it should remove an item from a collection with action key", () => {
      const state = [ { id: 1, a: 1 }, { id: 2, a: 2 } ]
      const action = { id: 1, data: { } }

      expectEqual(reducers.removeById(state, action), [
        { id: 2, a: 2 },
      ])
    })
  })

  describe(".updateOrCreateByKey", () => {
    test("it should create an item if it does not exist", () => {
      const state = [ { a: 1, value: 10 }, { a: 2, value: 20 } ]
      const action = { data: { a: 3, value: 30 } }

      expectEqual(reducers.updateOrCreateByKey("a")(state, action), [
        { a: 1, value: 10 },
        { a: 2, value: 20 },
        { a: 3, value: 30 },
      ])
    })

    test("it should update an item if it does exist", () => {
      const state = [ { a: 1, value: 10 }, { a: 2, value: 20 } ]
      const action = { data: { a: 1, value: 30 } }

      expectEqual(reducers.updateOrCreateByKey("a")(state, action), [
        { a: 1, value: 30 },
        { a: 2, value: 20 },
      ])
    })
  })

  describe(".updateOrCreateById", () => {
    test("it should create an item if it does not exist", () => {
      const state = [ { id: 1, value: 10 }, { id: 2, value: 20 } ]
      const action = { data: { id: 3, value: 30 } }

      expectEqual(reducers.updateOrCreateById(state, action), [
        { id: 1, value: 10 },
        { id: 2, value: 20 },
        { id: 3, value: 30 },
      ])
    })

    test("it should update an item if it does exist", () => {
      const state = [ { id: 1, value: 10 }, { id: 2, value: 20 } ]
      const action = { data: { id: 1, value: 30 } }

      expectEqual(reducers.updateOrCreateById(state, action), [
        { id: 1, value: 30 },
        { id: 2, value: 20 },
      ])
    })
  })

  describe(".append", () => {
    test("it should append an item to a collection", () => {
      const state = [ 1, 2 ]
      const action = { data: 3 }

      expectEqual(reducers.append(state, action), [
        1,
        2,
        3,
      ])
    })
  })

  describe(".prepend", () => {
    test("it should prepend an item to a collection", () => {
      const state = [ 1, 2 ]
      const action = { data: 3 }

      expectEqual(reducers.prepend(state, action), [
        3,
        1,
        2,
      ])
    })
  })

  describe(".inKey", () => {
    test("it should apply a reducer to a property of an object", () => {
      const state = { list: [ 1, 2 ] }
      const action = { data: 3 }

      expectEqual(reducers.inKey("list", reducers.append)(state, action), {
        list: [ 1, 2, 3 ],
      })
    })
  })

  describe(".unique", () => {
    test("it should remove duplicates from a list", () => {
      const state = [ 1, 2, 3, 3 ]
      const action = { data: 5 }

      expectEqual(reducers.unique(state, action), [
        1,
        2,
        3,
      ])
    })
  })

  describe(".uniqueByKey", () => {
    test("it should remove duplicates from a list with a key", () => {
      const state = [ { a: 1 }, { a: 1 }, { a: 2 } ]
      const action = { data: 1 }

      expectEqual(reducers.uniqueByKey("a")(state, action), [
        { a: 1 },
        { a: 2 },
      ])
    })
  })

  describe(".pipe", () => {
    test("it should combine two unrelated reducers together", () => {
      const state = [ 1, 2, 3, 3 ]
      const action = { data: 4 }

      expectEqual(reducers.pipe(reducers.append, reducers.unique)(state, action), [
        1,
        2,
        3,
        4,
      ])
    })
  })
})
