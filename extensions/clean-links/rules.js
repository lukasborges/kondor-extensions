const cleanLinksParameterRules = [
  {
    hosts: ["*"],
    parameters: [
      "utm_*", "fbclid", "gclid", "gclsrc", "dclid", "gbraid", "wbraid", "msclkid", "yclid",
      "twclid", "ttclid", "mc_cid", "mc_eid", "igshid", "igsh", "_hsenc", "_hsmi", "__hstc",
      "__hssc", "__hsfp", "mkt_tok", "oly_anon_id", "oly_enc_id", "vero_id", "_openstat",
      "ref_src", "ref_url"
    ]
  },
  { hosts: ["youtube.com", "youtu.be", "spotify.com"], parameters: ["si"] },
  { hosts: ["x.com", "twitter.com"], parameters: ["s", "t"] }
];

const cleanLinksRedirectRules = [
  { host: /^(www\.)?google\.[a-z.]+$/, path: "/url", parameters: ["q", "url"] },
  { host: /^l[m]?\.facebook\.com$/, path: "/l.php", parameters: ["u"] },
  { host: /^l\.instagram\.com$/, parameters: ["u"] },
  { host: /^out\.reddit\.com$/, parameters: ["url"] },
  { host: /^(www\.)?youtube\.com$/, path: "/redirect", parameters: ["q"] }
];
