# Config Service settings: site `blueshieldca/bsca-careers`

For an administrator of the **`blueshieldca`** organization in the AEM Config Service
(admin.hlx.page). It connects the careers site code in GitHub to the content in Document
Authoring, so the site runs at `https://{branch}--bsca-careers--blueshieldca.aem.page`.

| | Value |
| --- | --- |
| Organization / site | `blueshieldca` / `bsca-careers` (the same names as in Document Authoring, so the DA Preview and Publish buttons reach this site) |
| Code | GitHub `aemsites/bsca-careers` (branches `develop`, `storybook`; `main` is not used yet) |
| Content | Document Authoring `blueshieldca/bsca-careers` (`https://content.da.live/blueshieldca/bsca-careers`) |
| Reference | The working site `nehaadobe/aca-careers-eds` has the same settings with the old names |

The site already exists in the Config Service (it serves the Document Authoring content today,
without code). Steps 2 to 4 update it. Step 1 is for an `aemsites` administrator.

## 1. Canonical site `aemsites/bsca-careers` (an `aemsites` Config Service admin)

`blueshieldca/bsca-careers` runs on code from another organization's repository (a "repoless"
site, https://www.aem.live/docs/repoless). AEM Code Sync (installed for all `aemsites` repositories)
copies a repository's code only to its **canonical site**: the site whose org and name are the
GitHub owner and repository, here `aemsites/bsca-careers`. That site does not exist yet (the Admin
API answers `config for site not found: aemsites/bsca-careers`), so no code reaches either site
and every code request returns 404.

Create it, signed in as an `admin` of the `aemsites` organization:

```sh
curl -X PUT https://admin.hlx.page/config/aemsites/sites/bsca-careers.json \
  -H "x-auth-token: $AUTH_TOKEN" -H "Content-Type: application/json" \
  --data '{
    "code": {
      "owner": "aemsites",
      "repo": "bsca-careers",
      "source": { "type": "github", "url": "https://github.com/aemsites/bsca-careers" }
    },
    "content": {
      "source": { "type": "markup", "url": "https://content.da.live/blueshieldca/bsca-careers" }
    }
  }'
```

The content source can be the same Document Authoring folder; this site's main job is to receive
the code. After it exists, the next push to the repository (any branch) syncs that branch, and
`https://develop--bsca-careers--blueshieldca.aem.page/head.html` returns 200. The project team can
push to trigger the first sync.

## 2. Code and content source

Sign in to the Admin API (https://admin.hlx.page/login, or the site admin UI at
https://tools.aem.live) with an account that is `admin` for `blueshieldca`. The examples use
the auth token of that session in `$AUTH_TOKEN`.

Read the current site configuration first and keep a copy:

```sh
curl -s -H "x-auth-token: $AUTH_TOKEN" \
  https://admin.hlx.page/config/blueshieldca/sites/bsca-careers.json > bsca-careers.before.json
```

Change the `code` section to the GitHub repository and make sure the `content` section points to
Document Authoring. Keep every other key of the file as it is (in particular `content.contentBusId`,
`access` and `apiKeys`):

```json
{
  "code": {
    "owner": "aemsites",
    "repo": "bsca-careers",
    "source": {
      "type": "github",
      "url": "https://github.com/aemsites/bsca-careers"
    }
  },
  "content": {
    "source": {
      "type": "markup",
      "url": "https://content.da.live/blueshieldca/bsca-careers"
    }
  }
}
```

Save the edited file back:

```sh
curl -s -X POST -H "x-auth-token: $AUTH_TOKEN" -H "Content-Type: application/json" \
  --data-binary @bsca-careers.json \
  https://admin.hlx.page/config/blueshieldca/sites/bsca-careers.json
```

## 3. Query index (sitemap and blog indexes)

The careers blocks read two indexes: `/sitemap.json` (every public page; used by the More
Stories cards) and `/blog/query-index.json` (the stories; used by the Blog listing and More
Stories). Their definition is the file `default-query.yaml` in the repository root (identical
to the index configuration of the working site). Upload it as the site's query configuration:

```sh
curl -s -o default-query.yaml \
  https://raw.githubusercontent.com/aemsites/bsca-careers/develop/default-query.yaml
curl -s -X POST -H "x-auth-token: $AUTH_TOKEN" -H "Content-Type: text/yaml" \
  --data-binary @default-query.yaml \
  https://admin.hlx.page/config/blueshieldca/sites/bsca-careers/content/query.yaml
```

The indexes fill when pages are **published**; previewing alone does not add them.

## 4. Access

The working site uses the default (`"access": { "admin": { "role": {}, "requireAuth": "auto" } }`):
anyone who may edit the content in Document Authoring can preview and publish. Keep that, or
list who may do what (example; use the real team accounts):

```json
{
  "access": {
    "admin": {
      "role": {
        "admin": ["admin@example.com"],
        "author": ["author@example.com"],
        "publish": ["publisher@example.com"]
      },
      "requireAuth": "auto"
    }
  }
}
```

The project team that runs the migration needs `author` (preview) and, for go-live, `publish`.

## Already done (no action)

- Document Authoring site settings for `blueshieldca/bsca-careers` (the Library: Blocks,
  Templates, Icons, Media Library) were set on 4 November 2026; the copy is in
  `docs/setup/da-site-config.json`.
- All pages, sheets, the navigation, footer, metadata and library content are in Document
  Authoring `blueshieldca/bsca-careers`.

## Check after steps 1 to 3

| Check | Expected |
| --- | --- |
| `https://develop--bsca-careers--blueshieldca.aem.page/head.html` | 200 (code from GitHub) |
| `https://develop--bsca-careers--blueshieldca.aem.page/` after previewing `/index` | The careers home page with header, footer and the Blue Shield theme |
| `https://admin.hlx.page/config/blueshieldca/sites/bsca-careers/content/query.yaml` | The two indexes `sitemap` and `blog` |

Then the project team previews (and later publishes) the pages on the new site.

## Later, at go-live (not now)

- **Production domain:** the CDN for careers.blueshieldca.com points to
  `main--bsca-careers--blueshieldca.aem.live`, and the site's CDN settings
  (`cdn.prod.host: careers.blueshieldca.com`, CDN type) are added so cache purges reach it.
- **Code on `main`:** the live site (`aem.live`) serves the `main` branch, which is still the
  repository template; the code is merged to `main` only when the team decides.
- **Consent and analytics:** OneTrust uses its production configuration on `*.aem.live` and
  `*.blueshieldca.com` (test configuration on `aem.page`); the Adobe Launch property allows
  `blueshieldca.com`. No change is expected, but check both after the domain switch.
