/** @jsx h */
import { h } from 'preact';
import { tw } from '@twind';

import { useDarkTheme } from '../hooks/useDarkTheme.ts';

export default () => {
  const { toggle } = useDarkTheme();
  return (
    <div>
      <h1 class={tw`text-3xl`}>
        <button class={tw`bg-black focus:outline-none cursor-default`} onClick={() => toggle()}>
          <span class={tw`font-bold`}>@kazuma0129</span>
        </button>
      </h1>
    </div>
  );
};
