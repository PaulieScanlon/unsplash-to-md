require('dotenv').config();
const fs = require('fs');
const https = require('https');
const { createApi } = require('unsplash-js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_API_KEY,
  fetch: fetch
});

async function init() {
  const {
    response: { results }
  } = await unsplash.search.getPhotos({
    query: 'nyc',
    page: 3,
    perPage: 30,
    color: 'black_and_white',
    orientation: 'landscape'
  });

  results.forEach((result) => {
    const {
      id,
      urls: { raw },
      created_at,
      description,
      alt_description,
      user: { name }
    } = result;
    const date = new Date(created_at);
    const year = date.getFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDay();

    const path = `${process.cwd()}/content/${year}/${month}/${day}`;

    const image = https.get(raw, (resp) => resp.pipe(fs.createWriteStream(`${path}/${id}.jpeg`)));

    fs.mkdirSync(path, { recursive: true }, (err) => {
      if (err) throw err;
    });

    fs.writeFileSync(
      `${path}/${id}.md`,
      `---\ndate: ${year}-${month}-${day}\nauthor: ${name}\nimage: ${id}.jpeg\n---\n${
        description ? description : alt_description || 'No description provided'
      }`,
      (err) => {
        if (err) throw err;
      }
    );
  });
}

init();
