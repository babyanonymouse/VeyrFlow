// @ts-nocheck
import * as __fd_glob_3 from "../docs/user-guide.md?collection=docs"
import * as __fd_glob_2 from "../docs/self-hosting-setup.md?collection=docs"
import * as __fd_glob_1 from "../docs/pwa-change-log.md?collection=docs"
import * as __fd_glob_0 from "../docs/index.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.doc("docs", "docs", {"index.mdx": __fd_glob_0, "pwa-change-log.md": __fd_glob_1, "self-hosting-setup.md": __fd_glob_2, "user-guide.md": __fd_glob_3, });

export const meta = await create.meta("meta", "docs", {});