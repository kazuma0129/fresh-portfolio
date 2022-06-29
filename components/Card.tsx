/** @jsx h */
import { h, VNode } from 'preact';
import { tw } from '@twind';

interface CardProp {
  title: string;
  children?: VNode | VNode[];
}

export const Card = ({ title, children }: CardProp) => {
  return (
    <div class={tw`my-1 px-1 w-full xs:w-1 sm:w-1 md:w-1/2 lg:my-4 lg:px-4 lg:w-1/2`}>
      <article class={tw`overflow-hidden rounded-lg`}>
        <header class={tw`flex items-center justify-between leading-tight p-2 md:p-4`}>
          <h1 class={tw`text-2xl`}>{title}</h1>
        </header>
        <body>{children}</body>
      </article>
    </div>
  );
};
