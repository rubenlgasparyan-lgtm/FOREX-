import { en } from './en';
import { ru } from './ru';
import { hy } from './hy';

export const langs = { en, ru, hy };
export type Lang = keyof typeof langs;
export type { I18n } from './en';
