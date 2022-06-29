/** @jsx h */
import { h } from 'preact';
import { tw } from '@twind';
import { Card } from '../components/Card.tsx';
import { ExternalLink } from '../components/ExternalLink.tsx';
import { writings, qualifications, careers, features, links } from '../constants/about.ts';
import LastUpdated from '../islands/LastUpdated.tsx';

export default function Portfolio() {
  return (
    <div class={tw`mx-10`}>
      <div class={tw`flex flex-col h-80 mt-10 text-center`}>
        <h1 class={tw`text-3xl`}>@kazuma0129</h1>
        <h2 class={tw`text-lg`}>Software Engineer, Tokyo, Japan</h2>
      </div>
      <div class={tw`flex justify-start flex-row flex-wrap mb-20`}>
        <Card title={'Background'}>
          <div class={tw`p-2 md:p-4`}>
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
          <div class={tw`p-2 md:p-4`}>Motorcycle, Netflix, Comedy, Ramen, ONSEN</div>
        </Card>
        <Card title={'Writings'}>
          <div class={tw`p-2 md:p-4`}>
            {writings.map((item) => {
              return (
                <div>
                  <ExternalLink url={item.url} title={item.title} />
                  <br />
                </div>
              );
            })}
          </div>
        </Card>
        <Card title={'Qualification'}>
          <div class={tw`p-2 md:p-4`}>
            {qualifications.map((item) => {
              return (
                <div class={tw`align-start`}>
                  <div class={tw`flex flex-row`}>
                    <div class={tw`mr-3`}>{item.date}</div>
                    <ExternalLink url={item.url} title={item.name} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title={'Carrers'}>
          <div class={tw`p-2 md:p-4`}>
            {careers.map((item) => {
              return (
                <div class={tw`align-start`}>
                  <div class={tw`flex flex-row`}>
                    <div class={tw`mr-3`}>{item.date}</div>
                    <ExternalLink url={item.url} title={item.corpName} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title={'Features'}>
          <div class={tw`p-2 md:p-4`}>
            {features.map((item) => {
              return (
                <div class={tw`align-start`}>
                  <div class={tw`flex flex-row`}>
                    <div class={tw`mr-3`}>{item.date}</div>
                    <ExternalLink url={item.url} title={item.title} />
                  </div>
                </div>
              );
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
      <div class={tw`flex flex-row justify-center mb-5`}>
        <LastUpdated />
      </div>
    </div>
  );
}
