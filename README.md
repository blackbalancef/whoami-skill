# WhoAmI Skill

Open-source skill that turns your existing AI agent into a WhoAmI identity agent.

Install this repository in Claude Code, Codex, Cursor, Grok, or any compatible agent, then tell it:

```text
Install the WhoAmI skill from https://github.com/blackbalancef/whoami-skill
and create my profile.

Creation code: XXXX-XXXX
API: https://<your-deployment>.convex.site
```

Get a creation code from the WhoAmI landing page. The platform lives at
[blackbalancef/whoami-ai](https://github.com/blackbalancef/whoami-ai).

```text
whoami-skill/
├── SKILL.md
├── scripts/
│   ├── discover.mjs
│   └── whoami.mjs
└── README.md
```

The skill never uploads source, `.env`, keys, or shell history. Only the JSON you approve is published. After publish, edit credentials are stored at `~/.whoami/credentials.json`. Your agent is the CMS — there is no Edit Profile page.

Optional custom site:

```bash
node scripts/whoami.mjs site init --dir ./site
node scripts/whoami.mjs site upload --dir ./site
node scripts/whoami.mjs site publish
```
