import { Moment } from "moment";

// pulled from https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline

export type Tweet = {
  /**
   * The datetime the tweet was posted
   * @example
   * "Thu Apr 06 15:28:43 +0000 2017"
   */
  created_at: string;

  /**
   * The unique tweet ID as a string
   * @example
   * "850007368138018817"
   */
  id_str: string;

  /** The content of the tweet */
  text: string;

  retweeted_status: Object | undefined;
  in_reply_to_status_id: any;
  in_reply_to_status_id_str: any;
  in_reply_to_user_id: any;
  in_reply_to_user_id_str: any;
  in_reply_to_screen_name: any;
};
