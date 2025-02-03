npm run prebuild
npm run build
npm run start

# Overview

This is a starter Node.js app configured for TypeScript. The app is generated
using [create-cloud-run-app]:

```
npx create-cloud-run-app [path]
```

> **Note**
>
> - If `path` isn't specified, it defaults to the current working directory (`.`).
> - The directory under `path` must be empty.

See [article on dev.to] for more details.

Configuration boilerplate includes:

-   [TypeScript]
-   [Express]
-   [Jest]
-   Linting and formatting
    -   [EditorConfig]
    -   [ESLint]
    -   [Prettier]

The linting and formatting tools have been configured to  work together:

* `.editorconfig` has format settings that feed into Prettier
* `.eslintrc.json` uses Prettier for formatting

It is also configured with a `pre-commit` hook using [Husky] and [lint-staged]
that will automatically reformat your source files when you commit.

## Development

The generated app includes a number of package scripts, most importantly:

- `build`
- `test` | `test:watch`
- `deploy`

For normal development, just run `test:watch`. This will restart the Express app
on file changes under the `src` or `test` directories, and also re-run tests.

There is also a `prepare` script that configures a git `commit` hook (using
[Husky]) for linting. You need to run this if you cloned this repo instead of
generating the app using [create-cloud-run-app].

## Notes

To use the latest published version of [@subfuzion/create-cloud-run-app], enter:

```
npx create-cloud-run-app@latest [path]
```

If you want to use the latest version [create-cloud-run-app] version from the
GitHub repo, enter:

```
npx github:subfuzion/create-cloud-run-app [path]
```

## License

Licensed under [MIT].

[article on dev.to]: https://dev.to/subfuzion/cloud-run-typescript-boilerplate-for-getting-started-4gco
[create-cloud-run-app]: https://github.com/subfuzion/create-cloud-run-app/
[EditorConfig]: https://editorconfig.org/
[ESLint]: https://eslint.org/
[Express]: https://expressjs.com/
[Husky]: https://typicode.github.io/husky/
[Jest]: https://jestjs.io/
[lint-staged]: https://github.com/okonet/lint-staged/
[MIT]: ./LICENSE
[Node.js]: https://nodejs.org/en/download/
[Prettier]: https://prettier.io/
[repo]: https://github.com/subfuzion/create-typescript-app/
[TypeScript]: https://typescriptlang.org/
[user.email]: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/setting-your-commit-email-address#setting-your-email-address-for-every-repository-on-your-computer/
[user.name]: https://docs.github.com/en/get-started/getting-started-with-git/setting-your-username-in-git#setting-your-git-username-for-every-repository-on-your-computer/
"# updori_cloudrun" 
