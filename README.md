# Twitch search dashboard
> Be the first viewer - say hi!

<img src="screenshot.jpg"/><br/>


## Features:
#### Sort all channels by recent or high to low
Quickly sort a channel by the start time (even 'Just chatting') or from high to low viewer count.
You can also filter by a language tag.

#### Block streams without a login
If you want to clean up your stream list you can click on the little trashcan icons to remove the stream from appearing in the list.

#### See partner streams
A partner stream is indicated by a blue border around the image.

## How to use it

Clone the repo
```bash
git clone --depth 1 https://github.com/m1ga/twitch_search_dashboard
```

Install node modules:
```bash
npm i
```

run node script
```bash
npm run start
```

Open `http://127.0.0.1:3000` in your browser

## Block list

You can use the little trashcan icon to block a user in the streamlist.
Blocked streams will be added to `blockList.json`. If you want to "unban" someone then you can remove the name from that file and restart the node script.

## Add more channels/languages

Simple add the channel name as an `<option>` to the channel selector
