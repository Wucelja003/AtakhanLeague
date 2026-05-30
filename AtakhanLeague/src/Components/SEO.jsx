import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://atakhanleague.com';
const DEFAULT_OG = `${SITE_URL}/og-image.png`;

export default function SEO({
  title,
  description = 'Atakhan League — the League of Legends tournament platform for every summoner. Register teams or sign up solo, climb the bracket, and compete for glory.',
  path = '/',
  image = DEFAULT_OG,
  noindex = false,
  keywords = 'League of Legends, LoL tournament, esports, LoL bracket, summoner rankings, gaming tournament, Atakhan League',
}) {
  const fullTitle = title
    ? `${title} | Atakhan League`
    : 'Atakhan League — LoL Tournament Platform';
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph (Facebook, Discord, LinkedIn) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Atakhan League" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
