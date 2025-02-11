import { theme, ThemeKey, Theme } from '@morfeo/core';
import { useState } from 'react';
import { useSubscribe } from './useSubscribe';

/**
 * Same as `theme.get()` but it will cause a re-render
 * each the theme is updated anywhere in your application.
 *
 * @returns the theme object
 */
export function useTheme() {
  const [t, setTheme] = useState(theme.get());

  useSubscribe(setTheme);

  return t;
}

/**
 * Same as `theme.getSlice(slice)` but it will cause a re-render
 * each the theme is updated anywhere in your application.
 *
 * @returns the theme slice
 */
export function useThemeSlice<TK extends ThemeKey>(slice: TK) {
  return useTheme()[slice];
}

/**
 * Same as `theme.getValue(slice, value)` but it will cause a re-render
 * each the theme is updated anywhere in your application.
 *
 * @returns the theme slice value
 */
export function useThemeValue<TK extends ThemeKey, TV extends keyof Theme[TK]>(
  slice: TK,
  value: TV,
) {
  return useThemeSlice(slice)[value];
}
