"use client";

import React from "react";
import { ContentBlock } from "@/types/database";
import { VocabSection, VocabLessonItem } from "../VocabSection";
import { KanjiSection, KanjiLessonItem } from "../KanjiSection";
import { TableBlock } from "./TableBlock";
import { CalloutBlock } from "./CalloutBlock";
import { GrammarBlock } from "./GrammarBlock";
import { DialogueBlock } from "./DialogueBlock";
import { ImageBlock } from "./ImageBlock";
import { HeadingBlock } from "./HeadingBlock";
import { ListBlock } from "./ListBlock";
import { TextBlock } from "./TextBlock";

export interface LessonBlockRenderOptions {
 block: ContentBlock;
 vocabList?: VocabLessonItem[];
 kanjiList?: KanjiLessonItem[];
}

/**
 * Clean Registry Dispatcher for lesson content blocks.
 * Maps block type string to dedicated block component.
 */
export function renderContentBlock({ block, vocabList = [], kanjiList = [] }: LessonBlockRenderOptions): React.ReactNode {
 const rawBlock = block as unknown as Record<string, unknown>;
 const type = (block.type || rawBlock._type || "text") as string;

 switch (type) {
 case "callout":
 case "calloutBlock":
 return <CalloutBlock block={block} />;
 case "dialogue":
 case "dialogueBlock":
 return <DialogueBlock block={block} />;
 case "grammar":
 case "grammarBlock":
 return <GrammarBlock block={block} />;
 case "image":
 case "imageBlock":
 return <ImageBlock block={block} />;
 case "vocab":
 case "vocabBlock":
 return <VocabSection vocabList={vocabList} />;
 case "kanji":
 case "kanjiBlock":
 return <KanjiSection kanjiList={kanjiList} />;
 case "list":
 return <ListBlock block={block} />;
 case "table":
 return <TableBlock block={block} />;
 case "heading":
 return <HeadingBlock block={block} />;
 case "text":
 case "article":
 default:
 return <TextBlock block={block} />;
 }
}
