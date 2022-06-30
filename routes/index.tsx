/** @jsx h */
import { h } from 'preact';
import { tw } from '@twind';
import { Card } from '../components/Card.tsx';
import { ExternalLink } from '../components/ExternalLink.tsx';
import { writings, qualifications, careers, features, links } from '../constants/about.ts';
import LastUpdated from '../islands/LastUpdated.tsx';
import ThemeButton from '../islands/ThemeButton.tsx';
import { FlexLinkAndDateRow } from '../components/FlexRow.tsx';

export default function Portfolio() {
  const bodyStyle = tw`p-2 md:p-4 font-semibold`;
  return (
    <div
      class={tw`antialiased dark:bg-black dark:text-white font-bold transition-colors duration-700`}
    >
      <div class={tw`mx-10`}>
        <div class={tw`flex flex-col h-80 pt-10 text-center`}>
          <ThemeButton />
          <h2 class={tw`text-lg`}>Software Engineer, Tokyo, Japan</h2>
        </div>
        <div class={tw`flex flex-row flex-wrap mb-20`}>
          <Card title={'Background'}>
            <div class={tw`${bodyStyle}`}>
              <p>I was born and raised in Aomori Prefecture, Japan.</p>
              <p>
                Graduate of
                <ExternalLink url='https://www.fun.ac.jp/en' title='Future University Hakodate.' />
                Bachelor of System Information Science.
              </p>
              <p>I'm currently working as a software Engineer in Tokyo, Japan.</p>
            </div>
          </Card>
          <Card title={'Interests'}>
            <div class={tw`${bodyStyle}`}>Motorcycle, Netflix, Comedy, Ramen, ONSEN</div>
          </Card>
          <Card title={'Writings'}>
            <div class={tw`${bodyStyle}`}>
              {writings.map((item) => {
                return (
                  <div>
                    <ExternalLink url={item.url} title={item.title} />
                  </div>
                );
              })}
            </div>
          </Card>
          <Card title={'Qualification'}>
            <div class={tw`${bodyStyle}`}>
              {qualifications.map((item) => {
                return <FlexLinkAndDateRow date={item.date} url={item.url} title={item.name} />;
              })}
            </div>
          </Card>
          <Card title={'Carrers'}>
            <div class={tw`${bodyStyle}`}>
              {careers.map((item) => {
                return <FlexLinkAndDateRow date={item.date} url={item.url} title={item.corpName} />;
              })}
            </div>
          </Card>
          <Card title={'Features'}>
            <div class={tw`${bodyStyle}`}>
              {features.map((item) => {
                return <FlexLinkAndDateRow date={item.date} url={item.url} title={item.title} />;
              })}
            </div>
          </Card>
        </div>
        <div class={tw`flex flex-row justify-center mb-10`}>
          {links.map((item) => {
            return (
              <div class={tw`mx-2`}>
                <ExternalLink url={item.url} title={item.name} />
              </div>
            );
          })}
        </div>
        <div class={tw`flex flex-row justify-center pb-5`}>
          <LastUpdated />
        </div>
      </div>
    </div>
  );
}
