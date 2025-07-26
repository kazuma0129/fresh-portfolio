import { Card } from "../components/Card.tsx";
import { ExternalLink } from "../components/ExternalLink.tsx";
import {
  careers,
  features,
  links,
  qualifications,
  writings,
} from "../constants/about.ts";
import LastUpdated from "../islands/LastUpdated.tsx";
import ThemeButton from "../islands/ThemeButton.tsx";
import { FlexLinkAndDateRow } from "../components/FlexRow.tsx";

export default function Portfolio() {
  return (
    <div>
      <div>
        <ThemeButton />
        <h2>Software Engineer, Tokyo, Japan</h2>
      </div>
      <div>
        <Card title="Background">
          <div>
            <p>I was born and raised in Aomori Prefecture, Japan.</p>
            <p>
              Graduate of{" "}
              <ExternalLink
                url="https://www.fun.ac.jp/en"
                title="Future University Hakodate."
              />{" "}
              Bachelor of System Information Science.
            </p>
            <p>I'm currently working as a software Engineer in Tokyo, Japan.</p>
          </div>
        </Card>
        <Card title="Interests">
          <div>
            Motorcycle, Netflix, Comedy, Ramen, ONSEN
          </div>
        </Card>
        <Card title="Writings">
          <div>
            {writings.map((item) => {
              return (
                <div>
                  <ExternalLink url={item.url} title={item.title} />
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Qualifications">
          <div>
            {qualifications.map((item) => {
              return (
                <FlexLinkAndDateRow
                  date={item.date}
                  url={item.url}
                  title={item.name}
                />
              );
            })}
          </div>
        </Card>
        <Card title="Carrers">
          <div>
            {careers.map((item) => {
              return (
                <FlexLinkAndDateRow
                  date={item.date}
                  url={item.url}
                  title={item.corpName}
                />
              );
            })}
          </div>
        </Card>
        <Card title="Features">
          <div>
            {features.map((item) => {
              return (
                <FlexLinkAndDateRow
                  date={item.date}
                  url={item.url}
                  title={item.title}
                />
              );
            })}
          </div>
        </Card>
      </div>
      <div>
        {links.map((item) => {
          return (
            <div>
              <ExternalLink url={item.url} title={item.name} />
            </div>
          );
        })}
      </div>
      <div>
        <LastUpdated />
      </div>
    </div>
  );
}
