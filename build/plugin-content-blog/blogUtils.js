"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkify = exports.generateBlogPosts = exports.generateBlogFeed = exports.truncate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const globby_1 = __importDefault(require("globby"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const reading_time_1 = __importDefault(require("reading-time"));
const feed_1 = require("feed");
const utils_1 = require("@docusaurus/utils");
function truncate(fileString, truncateMarker) {
    return fileString.split(truncateMarker, 1).shift();
}
exports.truncate = truncate;
// YYYY-MM-DD-{name}.mdx?
// Prefer named capture, but older Node versions do not support it.
const FILENAME_PATTERN = /^(\d{4}-\d{1,2}-\d{1,2})-?(.*?).mdx?$/;
function toUrl({ date, link }) {
    return `${link}`;
}
async function generateBlogFeed(context, options) {
    if (!options.feedOptions) {
        throw new Error('Invalid options - `feedOptions` is not expected to be null.');
    }
    const { siteDir, siteConfig } = context;
    const contentPath = path_1.default.resolve(siteDir, options.path);
    const blogPosts = await generateBlogPosts(contentPath, context, options);
    if (blogPosts == null) {
        return null;
    }
    const { feedOptions, routeBasePath } = options;
    const { url: siteUrl, title, favicon } = siteConfig;
    const blogBaseUrl = utils_1.normalizeUrl([siteUrl, routeBasePath]);
    const updated = (blogPosts[0] && blogPosts[0].metadata.date) ||
        new Date('2015-10-25T16:29:00.000-07:00');
    const feed = new feed_1.Feed({
        id: blogBaseUrl,
        title: feedOptions.title || `${title} Blog`,
        updated,
        language: feedOptions.language,
        link: blogBaseUrl,
        description: feedOptions.description || `${siteConfig.title} Blog`,
        favicon: utils_1.normalizeUrl([siteUrl, favicon]),
        copyright: feedOptions.copyright,
    });
    blogPosts.forEach((post) => {
        const { id, metadata: { title: metadataTitle, permalink, date, description }, } = post;
        feed.addItem({
            title: metadataTitle,
            id,
            link: utils_1.normalizeUrl([siteUrl, permalink]),
            date,
            description,
        });
    });
    return feed;
}
exports.generateBlogFeed = generateBlogFeed;
async function generateBlogPosts(blogDir, { siteConfig, siteDir }, options) {
    const { include, routeBasePath, truncateMarker, showReadingTime, editUrl, } = options;
    if (!fs_extra_1.default.existsSync(blogDir)) {
        return [];
    }
    const { baseUrl = '' } = siteConfig;
    const blogFiles = await globby_1.default(include, {
        cwd: blogDir,
    });
    const blogPosts = [];
    await Promise.all(blogFiles.map(async (relativeSource) => {
        const source = path_1.default.join(blogDir, relativeSource);
        const aliasedSource = utils_1.aliasedSitePath(source, siteDir);
        const refDir = path_1.default.parse(blogDir).dir;
        const relativePath = path_1.default.relative(refDir, source);
        const blogFileName = path_1.default.basename(relativeSource);
        const editBlogUrl = utils_1.getEditUrl(relativePath, editUrl);
        const { frontMatter, content, excerpt } = await utils_1.parseMarkdownFile(source);
        if (frontMatter.draft && process.env.NODE_ENV === 'production') {
            return;
        }
        if (frontMatter.id) {
            console.warn(chalk_1.default.yellow(`${blogFileName} - 'id' header option is deprecated. Please use 'slug' option instead.`));
        }
        let date;
        // Extract date and title from filename.
        const match = blogFileName.match(FILENAME_PATTERN);
        let linkName = blogFileName.replace(/\.mdx?$/, '');
        if (match) {
            const [, dateString, name] = match;
            date = new Date(dateString);
            linkName = name;
        }
        // Prefer user-defined date.
        if (frontMatter.date) {
            date = new Date(frontMatter.date);
        }
        // Use file modify time for blog.
        date = date || (await fs_extra_1.default.stat(source)).mtime;
        const slug = frontMatter.slug || (match ? toUrl({ date, link: linkName }) : linkName);
        frontMatter.title = frontMatter.title || linkName;
        blogPosts.push({
            id: frontMatter.slug || frontMatter.title,
            metadata: {
                permalink: utils_1.normalizeUrl([baseUrl, routeBasePath, slug]),
                editUrl: editBlogUrl,
                source: aliasedSource,
                description: frontMatter.description || excerpt,
                date,
                tags: frontMatter.tags,
                title: frontMatter.title,
                readingTime: showReadingTime
                    ? reading_time_1.default(content).minutes
                    : undefined,
                truncated: (truncateMarker === null || truncateMarker === void 0 ? void 0 : truncateMarker.test(content)) || false,
            },
        });
    }));
    blogPosts.sort((a, b) => b.metadata.date.getTime() - a.metadata.date.getTime());
    return blogPosts;
}
exports.generateBlogPosts = generateBlogPosts;
function linkify(fileContent, siteDir, blogPath, blogPosts) {
    let fencedBlock = false;
    const lines = fileContent.split('\n').map((line) => {
        if (line.trim().startsWith('```')) {
            fencedBlock = !fencedBlock;
        }
        if (fencedBlock) {
            return line;
        }
        let modifiedLine = line;
        const mdRegex = /(?:(?:\]\()|(?:\]:\s?))(?!https)([^'")\]\s>]+\.mdx?)/g;
        let mdMatch = mdRegex.exec(modifiedLine);
        while (mdMatch !== null) {
            const mdLink = mdMatch[1];
            const aliasedPostSource = `@site/${path_1.default.relative(siteDir, path_1.default.resolve(blogPath, mdLink))}`;
            let blogPostPermalink = null;
            blogPosts.forEach((blogPost) => {
                if (blogPost.metadata.source === aliasedPostSource) {
                    blogPostPermalink = blogPost.metadata.permalink;
                }
            });
            if (blogPostPermalink) {
                modifiedLine = modifiedLine.replace(mdLink, blogPostPermalink);
            }
            mdMatch = mdRegex.exec(modifiedLine);
        }
        return modifiedLine;
    });
    return lines.join('\n');
}
exports.linkify = linkify;
