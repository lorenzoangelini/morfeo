import {
  allProperties,
  AllProperties,
  BreakPoint,
  Property,
} from '@morfeo/spec';
import {
  Parser,
  AllParsers,
  ParserParams,
  ResolvedStyle,
  ResolverParams,
} from '../types';
import { baseParser } from './baseParser';
import { sizeParsers } from './sizes';
import { colorsParsers } from './colors';
import { spacesParsers } from './spaces';
import { shadowsParsers } from './shadows';
import { componentsParses } from './components';
import { deepMerge } from '../utils';
import { FALLBACK_PARSERS } from '../constants';
import { theme } from '../theme';

const allPropertiesKeys = Object.keys(allProperties) as (keyof AllProperties)[];

const DEFAULT_PARSERS = allPropertiesKeys.reduce(
  (acc, key) => ({
    ...acc,
    [key]: props =>
      baseParser({
        ...props,
        property: key,
        scale: allProperties[key],
      }),
  }),
  {} as AllParsers,
);

const ADDITIONAL_PARSERS = {
  ...sizeParsers,
  ...colorsParsers,
  ...spacesParsers,
  ...shadowsParsers,
  ...componentsParses,
};

const INITIAL_PARSERS = {
  ...FALLBACK_PARSERS,
  ...DEFAULT_PARSERS,
  ...ADDITIONAL_PARSERS,
};

type ParsersContext = {
  [P in Property]: Parser<P>;
};

export function createParsers() {
  let context = { ...INITIAL_PARSERS } as any as ParsersContext;

  function get() {
    return context;
  }

  function add<P extends Property>(property: P, parser: Parser<P>) {
    context[property as any] = parser;
  }

  function reset() {
    context = { ...INITIAL_PARSERS } as any as ParsersContext;
  }

  function resolveResponsiveProperty({
    property,
    value,
    style,
  }: ParserParams<typeof property>) {
    const keys = Object.keys(value);
    return keys.reduce((acc, breakpoint) => {
      const mediaQuery = theme.resolveMediaQuery(breakpoint as BreakPoint);

      const currentValue = resolveProperty({
        property,
        value: value[breakpoint],
        style: {
          ...style,
          [property]: value[breakpoint],
        },
      });

      return {
        ...acc,
        [mediaQuery]: {
          ...acc[mediaQuery],
          ...currentValue,
        },
      };
    }, {});
  }

  function resolveProperty({
    property,
    value,
    style,
  }: ParserParams<typeof property>) {
    const parser: Parser<typeof property> = context[property];
    if (value && parser) {
      if (theme.isResponsive(value)) {
        return resolveResponsiveProperty({
          property,
          value,
          style,
        });
      }
      return parser({
        property,
        value,
        style,
      });
    }

    return {};
  }

  function resolve({ style = {} }: ResolverParams): ResolvedStyle {
    const { componentName, ...rest } = style;
    const properties = Object.keys(rest);

    const defaultComponentStyle = componentName
      ? resolveProperty({
          property: 'componentName',
          value: componentName,
          style,
        })
      : {};

    const parsedStyle = properties.reduce((acc, property) => {
      return deepMerge(
        acc,
        resolveProperty({ property, value: style[property], style }),
      );
    }, {});

    return deepMerge(defaultComponentStyle, parsedStyle);
  }

  const parsers = {
    get,
    add,
    reset,
    resolve,
    resolveProperty,
  };

  globalThis.__MORFEO_PARSERS = parsers;

  return parsers;
}