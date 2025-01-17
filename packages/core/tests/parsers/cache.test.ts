import { Theme } from '@morfeo/spec';
import { parsers, theme } from '../../src';

const THEME: Theme = {
  colors: {
    primary: 'white',
    secondary: 'black',
  },
} as any;

describe('cache', () => {
  beforeEach(() => {
    theme.set(THEME);
  });

  afterEach(() => {
    parsers.resetCache();
  });

  test('should set the cache after resolving a style', () => {
    parsers.resolve({ color: 'primary' });

    expect(parsers.getCache()).toEqual({
      color: { primary: { color: 'white' } },
    });
  });

  test('should reset the cache after a change of the theme', () => {
    parsers.resolve({ color: 'primary' });

    theme.set({
      colors: {
        primary: 'black',
        secondary: 'white',
      },
    } as any);
    expect(parsers.getCache()).toEqual({});
  });

  test('should return a different value for the same style if the theme is updated', () => {
    const firstStyle = parsers.resolve({ color: 'primary' });
    theme.set({
      colors: {
        primary: 'black',
        secondary: 'white',
      },
    } as any);
    const secondStyle = parsers.resolve({ color: 'primary' });
    expect(firstStyle).toEqual({ color: 'white' });
    expect(secondStyle).toEqual({ color: 'black' });
    expect(parsers.getCache()).toEqual({
      color: { primary: { color: 'black' } },
    });
  });

  test('should return a different value for the same style if the theme is updated and the cache is disabled', () => {
    parsers.disableCache();
    const firstStyle = parsers.resolve({ color: 'primary' });
    parsers.enableCache();
    theme.set({
      colors: {
        primary: 'black',
        secondary: 'white',
      },
    } as any);
    const secondStyle = parsers.resolve({ color: 'primary' });
    expect(firstStyle).toEqual({ color: 'white' });
    expect(secondStyle).toEqual({ color: 'black' });
  });
});
