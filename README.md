# registry-of-trust
This is a showcase repository with a reference implementation of certain funC patters, namely 
- [constructor pattern](https://temni.github.io/posts/constructor-pattern/)
- [registry of trust pattern](https://temni.github.io/posts/registry-of-trust/).

It consists of three contracts A, B and C, where:
- `A` owns `B`
- `B` is a sharded collection of `C` acting as a registry of trust so `A` can interract with "it's" items safely.

Also, a direct interraction between `A` and `C` is implemented to show the difference in transactions cost (it is about 0.0076516 TON).
## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.

## How to use

### Build

`npx blueprint build` or `yarn blueprint build`

### Test

`npx blueprint test` or `yarn blueprint test`