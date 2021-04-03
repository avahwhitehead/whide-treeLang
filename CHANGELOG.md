# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.1.0 (2021-04-03)


### Features

* added a lexer for the language ([2142bb8](https://github.com/sonrad10/whide-treeLang/commit/2142bb8fb09115aa9f0f39884b7686b09a501651))
* added a parser as an intermediate step between lexing and conversion ([0abffcd](https://github.com/sonrad10/whide-treeLang/commit/0abffcdb6807747235cb9f7bd00d777b2987c42c))
* added exported methods to use this as a module ([209c349](https://github.com/sonrad10/whide-treeLang/commit/209c349d3889f473ff5fdec9fe1b689c81f278c1))
* added lexer support for counters ([f094629](https://github.com/sonrad10/whide-treeLang/commit/f094629147f02a7324fe4908eb70ef7ef63abbac))
* added matching support for tree strings ([b092e47](https://github.com/sonrad10/whide-treeLang/commit/b092e4746ca9be3a9b0567e39628f3738b1dd11c))
* added support for `...` at the end of a fixed list meaning "allow anything" ([a42789e](https://github.com/sonrad10/whide-treeLang/commit/a42789e936ae08014e865738c3c967d35c8fe121))
* added support for converting trees with `nil`/`int`/`any` tokens ([1781867](https://github.com/sonrad10/whide-treeLang/commit/178186789726aba874f0ca139b7245d0d5e3f4de))
* added support for parsing fixed type lists ([fcea181](https://github.com/sonrad10/whide-treeLang/commit/fcea181fbecf177992bb7335145692bf4f5160e3))
* added tests for unexpected tokens ([76f826c](https://github.com/sonrad10/whide-treeLang/commit/76f826c50d464dd0da9b68b1fdb523db45c5f636))
* extracted expecting tokens to its own method ([cc72779](https://github.com/sonrad10/whide-treeLang/commit/cc7277906c047c7c50dc0b85f6a6e4ef8c778cbb))
* implemented the converter to perform a boolean match with a binary tree against a conversion tree ([e546fa4](https://github.com/sonrad10/whide-treeLang/commit/e546fa4afa365cd49772bbed4f50f35691fa0787))
* made parser treat [] as an `any` input ([53e7dbc](https://github.com/sonrad10/whide-treeLang/commit/53e7dbc956ba5340f303b805bd27cd17ef776e12))
* made the converter convert trees using the result of the parser ([99cf3a5](https://github.com/sonrad10/whide-treeLang/commit/99cf3a507577d010c7a7dc69ec9dd2743b551d2c))
* removed support for TKN_DOTS because it is basically unnecessary and a lot of work ([b981815](https://github.com/sonrad10/whide-treeLang/commit/b981815b0b4db7294fbcee3e28f9f22da2e36771))
* renamed runConvert.ts to converter.ts ([f6c965d](https://github.com/sonrad10/whide-treeLang/commit/f6c965d4bc6d8eb6ba84761498ce36915cf463e2))


### Bug Fixes

* added some tests from TODOs ([5392da8](https://github.com/sonrad10/whide-treeLang/commit/5392da8a8a2536b25deb9cfe88f649739a6f18d2))
* disabled eslint no-explicit-any rule ([664d802](https://github.com/sonrad10/whide-treeLang/commit/664d802fb0cad849ab862359709bf5ba9511b3c5))
* fixed failing test from typescript error ([789e901](https://github.com/sonrad10/whide-treeLang/commit/789e90198b14a214e8d6078cb348d253d7cf994c))
* moved token type check so that it is run every time an atom is read ([0a0d3e9](https://github.com/sonrad10/whide-treeLang/commit/0a0d3e937547bbc45a9165e60e491be6caac860f))
* reformatted lexer tests file ([f3fa3bf](https://github.com/sonrad10/whide-treeLang/commit/f3fa3bfd92cb6956f841997e2f3374a05fba5aa9))
