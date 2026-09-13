# WhoAmI Skill

Open-source skill that turns your existing AI agent into a WhoAmI identity agent.

Install this repository in Claude Code, Codex, Cursor, Grok, or any compatible agent, then tell it:

```text
Install the WhoAmI skill from https://github.com/blackbalancef/whoami-skill
and create my profile.

Creation code: XXXX-XXXX
API: https://<your-deployment>.convex.site
```

```text
whoami-skill/
├── SKILL.md
├── scripts/
│   ├── discover.mjs      # apps, CLIs, skills, plugins, public GitHub
│   └── whoami.mjs
└── README.md
```

`discover.mjs` proposes what is on the machine. The skill interviews against that list (which tools, skills, and projects to keep). It never uploads source, `.env`, keys, or shell history. Only the JSON you approve is published. After publish, edit credentials are stored at `~/.whoami/credentials.json`. Your agent is the CMS — there is no Edit Profile page.

Optional avatar (JPEG / PNG / WebP from a local file the owner reviewed):

```bash
node scripts/whoami.mjs avatar --file ./me.jpg
node scripts/whoami.mjs avatar --clear
```

Optional custom site:

```bash
node scripts/whoami.mjs site init --dir ./site
node scripts/whoami.mjs site upload --dir ./site
node scripts/whoami.mjs site publish
```
