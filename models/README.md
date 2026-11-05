# Model format

One JSON file per model, named after its `referenceName`.

```jsonc
{
  "referenceName": "Hero",            // unique per instance; what code and the API use
  "displayName": "Hero",              // what an editor sees
  "kind": "component",                // "component" or "content"
  "listType": "list",                 // content models only: "list" or "item"
  "description": "…",                 // the short line editors see; written for people, not agents
  "agentGuidance": null,              // see below; null until written
  "fields": [
    { "name": "Heading", "label": "Heading", "type": "Text", "settings": { "Required": "True" } }
  ]
}
```

`fields[].settings` holds Agility's field settings as stored, with empty values left out. Booleans are the
strings `"True"` and `"False"`.

## `agentGuidance`, version 1

```jsonc
{
  "version": 1,
  "useWhen": "The first thing on a landing or campaign page: one headline, a short subhead, one CTA.",
  "avoidWhen": "Inside body content, or more than once on a page.",
  "alternatives": [
    { "referenceName": "Header", "when": "a plain title with no image or CTA" }
  ],
  "placement": ["top"],         // components only: any of top | body | bottom | sidebar | anywhere
  "maxPerPage": 1,              // components only, optional
  "fieldTips": { "Heading": "8 words or fewer" }
}
```

`placement` and `maxPerPage` are advice, never rules. What a page accepts is decided by the instance's
component availability settings. `alternatives[].referenceName` always names another model in this repo.
