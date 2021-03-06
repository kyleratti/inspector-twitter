import compromise from "compromise";
import dotenv from "dotenv";
import moment from "moment";
import Twitter from "twitter-lite";
import DataManager from "./data/datamanager";
import { Phrase, PhraseManager, Sentiment } from "./phrases";
import { Tweet } from "./twitter";
import { SentimentManager } from "./phrases";
var SentimentLib = require("sentiment");
// import { Sentiment } from "sentiment";

dotenv.config();

const [apiKey, apiSecret, accessToken, accessSecret] = [
  String(process.env.TWITTER_API_KEY),
  String(process.env.TWITTER_API_SECRET),
  String(process.env.TWITTER_ACCESS_TOKEN),
  String(process.env.TWITTER_ACCESS_SECRET),
];

const targetHandle = String(process.env.TARGET_HANDLE);

const dataManager = new DataManager();

// @ts-ignore
const twitterClient: Twitter.Twitter = new Twitter({
  consumer_key: apiKey,
  consumer_secret: apiSecret,
  access_token_key: accessToken,
  access_token_secret: accessSecret,
});

const getOlderTweets = async (handle: string, oldestId?: string) => {
  let allTweets: Tweet[] = [];

  let options = {
    screen_name: targetHandle,
    count: 200,
    include_rts: false,
    exclude_replies: true,
    trim_user: true,
  };

  if (oldestId != undefined)
    options = Object.assign(options, { max_id: oldestId });

  let tweets: Tweet[] = await twitterClient.get(
    "statuses/user_timeline",
    options
  );

  tweets.forEach((obj: Tweet) => {
    allTweets.push(obj);
  });

  return allTweets;
};

const getRateLimitStatus = async () => {
  const res = await twitterClient.get("application/rate_limit_status", {
    resources: "statuses",
  });

  return res.resources;
};

const momentFromTweet = (tweet: Tweet) =>
  moment(tweet.created_at, "ddd MMM DD HH:mm:ss +ZZ YYYY");

const findOldest = (tweets: Tweet[]) => {
  let oldest = tweets[0];

  for (let i = 1; i < tweets.length; i++) {
    const tweet = tweets[i];
    if (momentFromTweet(tweet).isBefore(momentFromTweet(oldest)))
      oldest = tweet;
  }

  return oldest;
};

const getAllTweets = async (handle: string, attemptToPaginate?: boolean) => {
  let allTweets: Tweet[] = [];

  console.log(
    "Rate Limit Status: ",
    (await getRateLimitStatus()).statuses["/statuses/user_timeline"]
  );

  if (attemptToPaginate) {
    let capturedAll = false;
    while (!capturedAll) {
      let tweets = await getOlderTweets(handle, findOldest(allTweets)?.id_str);

      tweets.forEach((tweet) => {
        allTweets.push(tweet);
      });

      capturedAll =
        tweets.length < 1 ||
        (tweets.length === 1 &&
          tweets[0].id_str === allTweets[allTweets.length - 1].id_str);
    }
  }

  allTweets.forEach((obj: Tweet) => {
    if (!dataManager.hasTweet(obj.id_str)) dataManager.add(obj);
  });

  return allTweets;
};

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

const logMostPopular = (thing: Phrase[]) => {
  for (let i = 0; i < clamp(thing.length, 0, 5); i++) {
    const phrase = thing[i];
    console.log(`    #${i + 1}: ${phrase.text} (${phrase.count} times)`);
  }
};

const logTopSentiment = (thing: Sentiment[]) => {
  for (let i = 0; i < clamp(thing.length, 0, 5); i++) {
    const phrase = thing[i];
    console.log(`    #${i + 1}: ${phrase.text}`);
  }
};

const analyze = () => {
  const tweets = dataManager.getAll();

  const sentiment = new SentimentLib();
  const sentimentManager = new SentimentManager();

  const [topics, nouns, verbs] = [
    new PhraseManager(),
    new PhraseManager(),
    new PhraseManager(),
  ];

  tweets.forEach((tweet) => {
    const parser = compromise(tweet.text);

    const [tweetTopics, tweetNouns, tweetVerbs] = [
      parser.topics(),
      parser.nouns(),
      parser.verbs(),
    ];

    tweetTopics.forEach((topic) => {
      const text = topic.text().trim().toLowerCase();
      if (text.length <= 2) return;

      topics.addOrIncrement(text);
    });

    tweetNouns.forEach((noun) => {
      const text = noun.text().trim().toLowerCase();
      if (text.length <= 2) return;

      nouns.addOrIncrement(text);
    });

    tweetVerbs.forEach((verb) => {
      const text = verb.text().trim().toLowerCase();
      if (text.length <= 2) return;

      verbs.addOrIncrement(text);
    });

    sentimentManager.add(tweet.text, sentiment.analyze(tweet.text).score);
  });

  const [sortedTopics, sortedNouns, sortedVerbs] = [
    topics.getSorted(),
    nouns.getSorted(),
    verbs.getSorted(),
  ];

  const [sortedGoodSentiment, sortedBadSentiment] = [
    sentimentManager.sortGood(),
    sentimentManager.sortBad(),
  ];

  console.log("== Tweet Data ==");
  console.log("  Username:", `@${targetHandle}`);
  console.log("  Total:", tweets.size);
  console.info(
    "Note that Twitter will not let me retrieve any tweets beyond 3,200 tweets from this moment"
  );
  if (tweets.size < 3200)
    console.info(
      `Only ${tweets.size} are shown as the ${
        3200 - tweets.size
      } others were retweets and replies (which were filtered out of this analysis)`
    );

  console.info("== Topics ==");
  console.log("  Total:", topics.size);
  logMostPopular(sortedTopics);

  console.info("== Nouns ==");
  console.log("  Total:", nouns.size);
  logMostPopular(sortedNouns);

  console.info("== Verbs ==");
  console.log("  Total:", verbs.size);
  logMostPopular(sortedVerbs);

  console.info("== Top Good Sentiment ==");
  logTopSentiment(sortedGoodSentiment);

  console.info("== Top Bad Sentiment ==");
  logTopSentiment(sortedBadSentiment);
};

const run = async () => {
  try {
    await twitterClient.get("account/verify_credentials");

    if (!dataManager.targetExists()) {
      console.log("Target data does not exist; fetching");
      const tweets = await getAllTweets(targetHandle, true);
      console.log("Got all tweets", tweets);
      dataManager.save();
    } else dataManager.load();

    analyze();
    console.log("Goodbye");
  } catch (err) {
    console.error(err);
  }
};

run();
