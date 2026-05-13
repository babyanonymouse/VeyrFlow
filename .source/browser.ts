// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../docs/index.mdx?collection=docs"), "pwa-change-log.md": () => import("../docs/pwa-change-log.md?collection=docs"), "self-hosting-setup.md": () => import("../docs/self-hosting-setup.md?collection=docs"), "user-guide.md": () => import("../docs/user-guide.md?collection=docs"), }),
};
export default browserCollections;