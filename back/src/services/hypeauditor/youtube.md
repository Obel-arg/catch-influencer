Report
HypeAuditor For YouTube
Endpoint

Get the report of a YouTube channel if it’s ready or requests the report if it’s not ready.

JSON

GET https://hypeauditor.com/api/method/auditor.youtube/?channel={channel}&features={featuresList}
channel is the identifier of the channel from the URL. It can be channel ID: UCLA_DiR1FfKNvjuUpBHmylQ or channel username: NASA.

E.g.:

https://www.youtube.com/channel/UCLA_DiR1FfKNvjuUpBHmylQ
https://www.youtube.com/@NASA

Error codes

You will receive error if requested channel is not found, has no videos or no views.

CHANNEL_NOT_FOUND channel not found on YouTube
NO_VIDEOS channel has no videos
NO_VIEWS channel has no views
Response Object

Attributes Type
report_state string YouTube report state
report_quality object YouTube report quality
report object YouTube report data
metrics_history object report metrics history
media object YouTube videos of the channel
report_state

String report_state identifies if the requested report is fully ready or lacks demographic data due to the low audience activity. List of report states:

Report state Description
READY Report is fully ready and contains all metrics
READY_LOW_CONFIDENCE Report lacks metrics audience_age_gender, audience_geo, audience_languages
NOT_READY Report is still generating
Report Object

Attributes Type
basic object general information about the channel
metrics object channel metrics and calculated metrics
features object rich data about channel

Basic Object

❗️
IMPORTANT

Object category_name is deprecated since 11/2023
Attributes Type
id string channel id
username string channel username
title string channel title
avatar_url string channel avatar url
description string channel description
category_name string DEPRECATED use features.blogger_thematics instead.
last_video_time int timestamp if available
Metrics Object

Each metrics objects may contain value field and performance object. Performance object contains 4 periods of data: (30d for 30 day data, 90d for 90, 180d for 180 and all for all-time data). Each period object contains value computed for current period (30/90/180d) and value_prev computed for the same period before current. For example: on 4th of July value shows data for Jun 5 - Jul 4 and value_prev shows data for May 4 - Jun 4.

subscribers_count
Attributes Type
value int Number of total subscribers
performance.value int number of new subscribers in a given period
media_count
Attributes Type
value int Number of total media
performance.value int number of new media in a given period
views_count
Attributes Type
value int Number of total views
performance.value int number of views in a given period
views_avg
Attributes Type
performance.value int number of average views in a given period
videos_v30
Views 30d

Attributes Type
performance.value int
er
Engagement Rate

Attributes Type
performance.value float
alikes_count
Attributes Type
performance.value int number of likes and dislikes in a given period
likes_count
Attributes Type
performance.value int number of likes in a given period
dislikes_count
Attributes Type
performance.value int number of dislikes in a given period
comments_count
Attributes Type
performance.value int number of comments in a given period
video_views_count
Attributes Type
performance.value int number of views on videos posted in a given period
video_views_avg
Attributes Type
performance.value int average number of views on videos posted in a given period
comments_rate
Attributes Type
performance.value float comments to views ratio - comments per 100 views
performance.is_reactions_allowed bool if any video in a given period can be rated
performance.is_comments_enabled bool if any video in a given period can be commented
performance.mark string quality mark
reactions_rate
Attributes Type
performance.value float likes and dislikes to views ratio
performance.is_reactions_allowed bool if any video in a given period can be rated
performance.is_comments_enabled bool if any video in a given period can be commented
performance.mark string quality mark
ltd_rate
❗️
IMPORTANT

This metric is deprecated since 11/2021

Attributes Type
performance.value float likes to dislikes ratio
performance.is_reactions_allowed bool if any video in a given period can be rated
performance.is_comments_enabled bool if any video in a given period can be commented
performance.mark string quality mark
likes_comments_ratio
Attributes Type
performance.value float likes to comments ratio
performance.value_prev float likes to comments ratio previous value
performance.is_rating_allowed bool if any video in a given period can be rated
performance.is_comments_enabled bool if any video in a given period can be commented
performance.similar int similar accounts value
performance.mark atring quality mark
videos_per_week
Attributes Type
performance.value float average number of videos per week in a given period
performance.mark string quality mark
comments_avg
Attributes Type
performance.value float average number of comments on videos in a given period
performance.mark string quality mark
likes_comments_ratio
Attributes Type
value int Likes comments ratio through all time activity
performance.value int Likes comments ratio in a given period
performance.value_prev int Likes comments ratio in a previous period
performance.mark int Description of comparison with similar bloggers
performance.similar int Likes comments ratio a in a given period of similar bloggers
performance.similar_min int Min likes comments ratio in a given period of similar bloggers
performance.similar_max int Max likes comments ratio in a given period of similar bloggers
alikes_avg
Attributes Type
performance.value float average number of likes and dislikes on videos in a given period
performance.mark string quality mark
Mark:

excellent
good
average
fair
poor
Features Object
audience_geo
Audience geo. If object is null that means no data available for channel.

Attributes Type
data array array of {title: string, prc: float} objects. Title is ISO Alpha-2 two letter country code. United Kingdom is uk
audience_age_gender
Audience age gender distribution. If object is null that means no data available for channel.

Attributes Type
data object Dict of age objects. Each age object contains two genders (male and female).
Age objects are: 13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+

audience_languages
Audience languages. If object is null that means no data available for channel.

Attributes Type
data array array of {title: string, prc: float} objects. Title is ISO 2 Letter Language Code.
audience_races
Audience Ethnicity. If object is null that means no data available for channel.

Attributes Type
data array array of {group: string, prc: float} objects. Group is the name of ethnicity group. Ex. ‘caucasian’, ‘indian’, ‘hispanic’, ‘asian’, ‘african’, ‘arabian’
audience_sentiments
Attributes Type
data.sentiments.POSITIVE.count int count of positive comments
data.sentiments.POSITIVE.prc float prc of positive comments
data.sentiments.NEUTRAL.count int count of neutral comments
data.sentiments.NEUTRAL.prc float prc of neutral comments
data.sentiments.NEGATIVE.count int count of negative comments
data.sentiments.NEGATIVE.prc float prc of negative comments
data.score int final score
data.comments_count int count of comments
data.posts_count int count of posts
blogger_languages
Blogger languages.

Attributes Type
data array array of [string] objects. ISO 2 Letter Language Code.
video_integration_price
Video integration price.

Attributes Type
data object keys: price, price_from, price_to
cqs
Channel Quality Score.

Attributes Type
data object keys: value, display_mark
blogger_geo
Attributes Type
data.country string Two char country code
blogger_emv
Attributes Type
data.emv int Forecasted EMV
data.emv_from int EMV start interval
data.emv_to int EMV finish interval
data.emv_per_dollar int EMV per dollar
data.emv_similar int EMV of similar bloggers
data.emv_mark int mark description for EMV, ex. ‘poor’
Mark:

excellent
very_good
good
fair
poor
blogger_rankings
Attributes Type
data.worldwide.rank int Position of the influencer in global top.
data.worldwide.delta int
data.country.country int Country object
data.country.rank int Position of the influencer in countrytop.
data.category.category int Country object
data.category.country int Category object
data.category.rank int Position of the influencer in category top.
blogger_emails
Attributes Type
data array List of blogger emails
blogger_prices
Attributes Type
data.post_price int Forecasted price of post
data.post_price_from int Post price start interval
data.post_price_to int Post price finish interval
blogger_thematics
Attributes Type
data array List of ids blogger categories. List of available thematics: Taxonomy
brand_safety
Is this blogger safe for brand, object like

Attributes Type
data.score int score based on criteria values from 0 to 9, 0 is safe blogger
data.mark string Description of brand safety score
data.items.{criteria}.value bool Is this criteria found in blogger content/comments
Marks:

POSITIVE if the attribute score is 0
NEUTRAL if the attribute score is less than 2
NEGATIVE if the attribute score is equal to or more than 2
most_media
Attributes Type
data.views_count_desc.performance.{time_period}.media_ids int Ids list of media with max views count in given period
data.engagement_desc.performance.{time_period}.media_ids int Ids list of media with max engagement rate in given period
data.time_added_desc.performance.{time_period}.media_ids int Ids list of last added media
blogger_views_likes_chart
Each dot is a video. X coordinate is the number of views, while Y is the number of reactions. Use it to see how predictable the numbers of views and reactions are

Attributes Type
data.id string ID of video
data.x int Number of views
data.y int Number of reactions
social_networks
Links to other blogger social networks. If the object is null that means no data is available for the blogger.

Attributes Type
data array array of {type: int, title: string, social_id: string, username, string, avatar_url: string, subscribers_count: int, er: float} objects.
type is integer code of social network,
title is name of blogger,
social_id is identifier in this network,
title is name in social network,
avatar_url is link to avatar,
subscribers_count is count of subscribers,
er is count of engagement rate
Social networks ids map:

Id Social network
1 Instagram
2 YouTube
3 TikTok
4 Twitch
5 Twitter
7 Snapchat
Metrics History Object
Contains videos_v30, er, subscribers_count, and media_count metrics history.

Attributes Type
videos_v30.history.time int Unix timestamp
videos_v30.history.value int Last observed value of metric
videos_v30.history.time_iso date Date in iso format
er.history.value float Last observed value of metric
er.history.time_iso date Date in iso format
subscribers_count.value int Last observed value of metric
subscribers_count.history.time int Unix timestamp
subscribers_count.history.value int Observed value of metric for specific period
subscribers_count.history.datetime date Date time
subscribers_count.history.time_iso date Date in iso format
media_count.value int Last observed value of metric
media_count.history.time int Unix timestamp
media_count.history.datetime date Date time
media_count.history.time_iso date Date in iso format
media_count.history.value int Observed value of metric for specific period
Media Object
Contains array of youtube media (videos) objects.

Attributes Type
id string Identifier of video
title string Video title
description string Video description
strict_reason string Restriction reason
is_sctricted boolean Is this media restricted
thumbnail string Thumbnail url
time_added int Timestamp video added
time_added_iso date Time video added in format iso
metrics array array of {views_count: int, likes_count: int, dislikes_count: int, rating_value: float, length_sec: int, comments_count: int, engagement: int, er: object, views_performance: float, cpm: object} objects
channel_ids array array of strings with channel ids
Metrics
Object metrics contains:

Attributes Type
views_count.value int Value of views for media object.
likes_count.value int Value of likes for media object.
dislikes_count.value int Value of dislikes for media object.
rating_value.value float Value of rating value for media object.
length_sec.value int Duration of media object in seconds.
comments_count.value int Value of comments for media object.
engagement.value int Engagement for media object.
er.value float Value of Engagement Rate for media object.
er.mark string Mark of Engagement Rate for media object. E.g.: average
views_performance float Value of Views Performance for media object.
cpm.value float Value of Cost per Mille for media object.
cpm.value_from float Initial value of Cost per Mille for media object.
cpm.value_to float Final value of Cost per Mille for media object.
cpm.performance string Performance object contains 6 periods of data: (7d for 7 days, 30d for 30 days, 90d for 90 days, 180d for 180 days, 365d for 365 days and all). Each period contains mark of CPM for media object. E.g.: poor

Sample request
JSON

GET https://hypeauditor.com/api/method/auditor.youtube/?channel=UCLA_DiR1FfKNvjuUpBHmylQ

Sample response

```json
{
  "result": {
    "report_state": "READY",
    "report_quality": "FULL",
    "report": {
      "basic": {
        "id": "UCLA_DiR1FfKNvjuUpBHmylQ",
        "username": "NASA",
        "title": "NASA",
        "avatar_url": "https://yt3.googleusercontent.com/2kw8s66dhLUegJ3XrqZSkZMfp77CRhCfYm1NurDwDB2L9sT_-CaoUix_iWjoE_t66b07JzoR=s900-c-k-c0x00ffffff-no-rj",
        "description": "NASA's mission is to pioneer the future in space exploration, scientific discovery, and aeronautics research.\r\n\r\nTo do that, we have worked around the world—and off it—for more than 60 years, searching for answers to fundamental questions about our place in the universe. We're exploring space and discovering Earth. Join us on this exciting and important journey.\n",
        "category_name": "Science & Technology",
        "is_verified": true
      },
      "metrics": {
        "subscribers_count": {
          "value": 11454597,
          "performance": {
            "30d": {
              "value": 100330,
              "value_prev": 82947
            },
            "90d": {
              "value": 260253,
              "value_prev": 63831
            },
            "180d": {
              "value": 328068,
              "value_prev": 375558
            },
            "365d": {
              "value": 707356,
              "value_prev": 1329792
            },
            "all": {
              "value": 10362226
            }
          }
        },
        "subscribers_growth_prc": {
          "value": null,
          "performance": {
            "30d": {
              "value": 0.88
            },
            "90d": {
              "value": 2.32
            },
            "180d": {
              "value": 2.95
            },
            "365d": {
              "value": 6.58
            }
          }
        },
        "media_count": {
          "value": 5715,
          "performance": {
            "30d": {
              "value": 18,
              "value_prev": 17
            },
            "90d": {
              "value": 51,
              "value_prev": 41
            },
            "180d": {
              "value": 93,
              "value_prev": 118
            },
            "all": {
              "value": 3077
            }
          }
        },
        "views_count": {
          "value": 965679228,
          "performance": {
            "30d": {
              "value": 6706473,
              "value_prev": 11906516
            },
            "90d": {
              "value": 26489816,
              "value_prev": 14901313
            },
            "180d": {
              "value": 41391129,
              "value_prev": 63290691
            },
            "all": {
              "value": 903472430
            }
          }
        },
        "views_avg": {
          "performance": {
            "30d": {
              "value": 74388,
              "value_prev": 63180
            },
            "90d": {
              "value": 73363,
              "value_prev": 55396
            },
            "180d": {
              "value": 63516,
              "value_prev": 102933
            },
            "365d": {
              "value": 77690,
              "value_prev": 92513
            },
            "all": {
              "value": 30883
            }
          }
        },
        "videos_v30": {
          "value": 48223,
          "performance": {
            "30d": {
              "value": null,
              "value_prev": null
            },
            "90d": {
              "value": null,
              "value_prev": null
            },
            "180d": {
              "value": null,
              "value_prev": null
            },
            "365d": {
              "value": null,
              "value_prev": null
            },
            "all": null
          }
        },
        "alikes_count": {
          "performance": {
            "30d": {
              "value": 0,
              "value_prev": 0
            },
            "90d": {
              "value": 0,
              "value_prev": 0
            },
            "180d": {
              "value": 0,
              "value_prev": 0
            },
            "all": {
              "value": 8452716
            }
          }
        },
        "likes_count": {
          "performance": {
            "30d": {
              "value": 77060,
              "value_prev": 86903
            },
            "90d": {
              "value": 213271,
              "value_prev": 215672
            },
            "180d": {
              "value": 428943,
              "value_prev": 1237836
            },
            "all": {
              "value": 14380160
            }
          }
        },
        "dislikes_count": {
          "performance": {
            "30d": {
              "value": 0,
              "value_prev": 0
            },
            "90d": {
              "value": 0,
              "value_prev": 0
            },
            "180d": {
              "value": 0,
              "value_prev": 0
            },
            "all": {
              "value": 236630
            }
          }
        },
        "comments_count": {
          "performance": {
            "30d": {
              "value": 0,
              "value_prev": 0
            },
            "90d": {
              "value": 0,
              "value_prev": 0
            },
            "180d": {
              "value": 0,
              "value_prev": 0
            },
            "all": {
              "value": 359949
            }
          }
        },
        "video_views_count": {
          "performance": {
            "30d": {
              "value": 2859655,
              "value_prev": 3642002
            },
            "90d": {
              "value": 8126886,
              "value_prev": 10431783
            },
            "180d": {
              "value": 18558669,
              "value_prev": 43908256
            },
            "all": {
              "value": 633192445
            }
          }
        },
        "video_views_avg": {
          "performance": {
            "30d": {
              "value": 74388.5,
              "value_prev": 63180.5
            },
            "90d": {
              "value": 73363,
              "value_prev": 55395.5
            },
            "180d": {
              "value": 63516,
              "value_prev": 102933
            },
            "all": {
              "value": 30883
            }
          }
        },
        "comments_rate": {
          "performance": {
            "30d": {
              "value": 0,
              "value_prev": 0,
              "is_comments_enabled": true,
              "mark": "none",
              "is_reactions_allowed": true
            },
            "90d": {
              "value": 0,
              "value_prev": 0,
              "is_comments_enabled": true,
              "mark": "none",
              "is_reactions_allowed": true
            },
            "180d": {
              "value": 0,
              "value_prev": 0,
              "is_comments_enabled": true,
              "mark": "none",
              "is_reactions_allowed": true
            },
            "all": {
              "value": 0,
              "is_comments_enabled": true,
              "mark": "none",
              "is_reactions_allowed": true
            }
          }
        },
        "reactions_rate": {
          "performance": {
            "30d": {
              "value": 30.124378,
              "value_prev": 35.180236,
              "is_comments_enabled": true,
              "mark": "good",
              "is_reactions_allowed": true
            },
            "90d": {
              "value": 32.402435,
              "value_prev": 38.500694,
              "is_comments_enabled": true,
              "mark": "good",
              "is_reactions_allowed": true
            },
            "180d": {
              "value": 36.420634,
              "value_prev": 38.338778,
              "is_comments_enabled": true,
              "mark": "good",
              "is_reactions_allowed": true
            },
            "all": {
              "value": 23.644655,
              "is_comments_enabled": true,
              "mark": "good",
              "is_reactions_allowed": true
            }
          }
        },
        "ltd_rate": null,
        "videos_per_week": {
          "performance": {
            "30d": {
              "value": 4,
              "value_prev": 2,
              "mark": "average"
            },
            "90d": {
              "value": 3,
              "value_prev": 1,
              "mark": "average"
            },
            "180d": {
              "value": 3,
              "value_prev": 2,
              "mark": "average"
            },
            "all": {
              "value": 5,
              "mark": "average"
            }
          }
        },
        "comments_avg": {
          "performance": {
            "30d": {
              "value": 0,
              "value_prev": 0,
              "mark": null
            },
            "90d": {
              "value": 0,
              "value_prev": 0,
              "mark": null
            },
            "180d": {
              "value": 0,
              "value_prev": 0,
              "mark": null
            },
            "all": {
              "value": 0,
              "mark": null
            }
          }
        },
        "alikes_avg": {
          "performance": {
            "30d": {
              "value": 0,
              "value_prev": 0,
              "mark": null
            },
            "90d": {
              "value": 0,
              "value_prev": 0,
              "is_rating_allowed": true,
              "is_comments_enabled": true
            },
            "180d": {
              "value": 0,
              "value_prev": 0,
              "is_rating_allowed": true,
              "is_comments_enabled": true
            },
            "all": {
              "value": 3047,
              "mark": null
            }
          }
        },
        "likes_comments_ratio": {
          "performance": {
            "7d": {
              "value": 0,
              "value_prev": 0,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 1.116646,
              "mark": "none"
            },
            "30d": {
              "value": 0,
              "value_prev": 0,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 3.830584,
              "mark": "none"
            },
            "90d": {
              "value": 0,
              "value_prev": 0,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 5.244269,
              "mark": "none"
            },
            "180d": {
              "value": 0,
              "value_prev": 0,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 5.403592,
              "mark": "none"
            },
            "365d": {
              "value": 0,
              "value_prev": 6.985915,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 5.81566,
              "mark": "none"
            },
            "all": {
              "value": 8.975291,
              "value_prev": 0,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 6.627307,
              "mark": "good"
            }
          }
        },
        "er": {
          "performance": {
            "7d": {
              "value": 3.485,
              "value_prev": 2.66,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 1.113152,
              "mark": "good"
            },
            "30d": {
              "value": 3.01,
              "value_prev": 3.52,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 2.942198,
              "mark": "good"
            },
            "90d": {
              "value": 3.24,
              "value_prev": 3.845,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 3.751199,
              "mark": "good"
            },
            "180d": {
              "value": 3.64,
              "value_prev": 3.83,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 3.747383,
              "mark": "good"
            },
            "365d": {
              "value": 3.77,
              "value_prev": 3.78,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 3.650331,
              "mark": "good"
            },
            "all": {
              "value": 2.4,
              "value_prev": 0,
              "is_rating_allowed": true,
              "is_comments_enabled": true,
              "similar": 3.031662,
              "mark": "average"
            }
          }
        }
      },
      "features": {
        "audience_geo": {
          "data": [
            {
              "title": "us",
              "prc": 39.22
            },
            {
              "title": "in",
              "prc": 10.22
            },
            {
              "title": "gb",
              "prc": 6.56
            },
            {
              "title": "ca",
              "prc": 5.08
            },
            {
              "title": "br",
              "prc": 4.25
            }
          ]
        },
        "audience_age_gender": {
          "data": {
            "13-17": {
              "male": 4.04,
              "female": 4.64
            },
            "18-24": {
              "male": 11.46,
              "female": 8.42
            },
            "25-34": {
              "male": 25.45,
              "female": 9.61
            },
            "35-44": {
              "male": 15.44,
              "female": 4.24
            },
            "45-54": {
              "male": 9.81,
              "female": 1.59
            },
            "55-64": {
              "male": 3.84,
              "female": 0.66
            },
            "65+": {
              "male": 0.53,
              "female": 0.27
            }
          }
        },
        "audience_languages": {
          "data": [
            {
              "title": "en",
              "prc": 90.12
            },
            {
              "title": "ru",
              "prc": 1.84
            },
            {
              "title": "pt",
              "prc": 1.52
            },
            {
              "title": "es",
              "prc": 1.32
            },
            {
              "title": "ar",
              "prc": 0.93
            },
            {
              "title": "de",
              "prc": 0.81
            },
            {
              "title": "Other",
              "prc": 3.46
            }
          ]
        },
        "audience_races": {
          "data": {
            "caucasian": 55.14,
            "indian": 13.98,
            "hispanic": 10.87,
            "asian": 10.34,
            "african": 7.22,
            "arabian": 2.45
          }
        },
        "audience_sentiments": {
          "data": {
            "sentiments": {
              "POSITIVE": {
                "count": 546,
                "prc": 74.69
              },
              "NEUTRAL": {
                "count": 172,
                "prc": 23.53
              },
              "NEGATIVE": {
                "count": 13,
                "prc": 1.78
              }
            },
            "score": 98,
            "comments_count": 731,
            "posts_count": 2
          }
        },
        "blogger_languages": {
          "data": ["en"]
        },
        "blogger_geo": {
          "data": {
            "country": "us"
          }
        },
        "blogger_emails": {
          "data": ["test5@nasa.com", "public-inquiries@hq.nasa.gov"]
        },
        "blogger_views_likes_chart": {
          "data": [
            {
              "id": "5wjsVp3kDO8",
              "x": 91632,
              "y": 2927
            },
            {
              "id": "M7KqDsykb3o",
              "x": 49380,
              "y": 2222
            },
            {
              "id": "XAv2sKblPRc",
              "x": 202183,
              "y": 3851
            },
            {
              "id": "92g5eiqb_fo",
              "x": 46966,
              "y": 2288
            },
            {
              "id": "Kdwyqctp908",
              "x": 1480922,
              "y": 36876
            },
            {
              "id": "-VIM6LSRLIA",
              "x": 53446,
              "y": 2022
            },
            {
              "id": "d6wFRZoz8UE",
              "x": 73363,
              "y": 6222
            },
            {
              "id": "bkIr9C4DzEA",
              "x": 75414,
              "y": 2111
            },
            {
              "id": "neZYcnduRTo",
              "x": 170468,
              "y": 2217
            },
            {
              "id": "ZSHnE8Pd5s4",
              "x": 29296,
              "y": 1172
            },
            {
              "id": "d6F9o6LKpVA",
              "x": 122089,
              "y": 1575
            },
            {
              "id": "6g9_kyHTaYI",
              "x": 64153,
              "y": 1615
            },
            {
              "id": "LyRIu-CYBdA",
              "x": 120840,
              "y": 3618
            },
            {
              "id": "TQcqOW39ksk",
              "x": 79912,
              "y": 2422
            },
            {
              "id": "zPHtJLt_rz4",
              "x": 38472,
              "y": 1295
            },
            {
              "id": "inSBC5U8KT4",
              "x": 15670,
              "y": 335
            },
            {
              "id": "Rs71YCXrXpg",
              "x": 83085,
              "y": 2207
            },
            {
              "id": "fwBBFmINkpw",
              "x": 62364,
              "y": 2085
            },
            {
              "id": "X8n5OA1m5o8",
              "x": 963863,
              "y": 17285
            },
            {
              "id": "B3wzSUwl1tQ",
              "x": 115118,
              "y": 2184
            },
            {
              "id": "4KgAfNIYlns",
              "x": 117295,
              "y": 3344
            },
            {
              "id": "73WB4OUB1-4",
              "x": 38659,
              "y": 1317
            },
            {
              "id": "nNVfoQoIKbo",
              "x": 63516,
              "y": 1785
            },
            {
              "id": "sw54jZNypxg",
              "x": 114729,
              "y": 2617
            },
            {
              "id": "9G8H7bND3F0",
              "x": 91708,
              "y": 2527
            },
            {
              "id": "QD2XDoeT8SI",
              "x": 1383360,
              "y": 25885
            },
            {
              "id": "WL7sNgGDGvk",
              "x": 48907,
              "y": 1775
            },
            {
              "id": "8_PlwfL5vi4",
              "x": 43889,
              "y": 1660
            },
            {
              "id": "LapcNp5La48",
              "x": 200516,
              "y": 3118
            },
            {
              "id": "zgCU5opdPhk",
              "x": 47522,
              "y": 1882
            }
          ]
        },
        "blogger_emv": {
          "data": {
            "emv": 1400,
            "emv_from": 1300,
            "emv_to": 1800,
            "emv_per_dollar": 0.94,
            "emv_mark": "average",
            "emv_similar": 0.719969
          }
        },
        "blogger_thematics": {
          "data": [19, 21]
        },
        "brand_safety": {
          "data": {
            "score": 0,
            "mark": "POSITIVE",
            "items": {
              "toxic": {
                "value": false
              },
              "offensive": {
                "value": false
              },
              "sentiment_negative": {
                "value": false
              },
              "alcohol": {
                "value": false
              },
              "politics": {
                "value": false
              },
              "religion": {
                "value": false
              },
              "pranks": {
                "value": false
              },
              "crime": {
                "value": false
              },
              "sex": {
                "value": false
              }
            }
          }
        },
        "most_media": {
          "data": {
            "time_added_desc": {
              "performance": {
                "7d": {
                  "media_ids": [
                    "5wjsVp3kDO8",
                    "M7KqDsykb3o",
                    "XAv2sKblPRc",
                    "92g5eiqb_fo",
                    "Kdwyqctp908",
                    "-VIM6LSRLIA"
                  ]
                },
                "30d": {
                  "media_ids": [
                    "5wjsVp3kDO8",
                    "M7KqDsykb3o",
                    "XAv2sKblPRc",
                    "92g5eiqb_fo",
                    "Kdwyqctp908",
                    "-VIM6LSRLIA",
                    "d6wFRZoz8UE",
                    "bkIr9C4DzEA",
                    "neZYcnduRTo"
                  ]
                },
                "90d": {
                  "media_ids": [
                    "5wjsVp3kDO8",
                    "M7KqDsykb3o",
                    "XAv2sKblPRc",
                    "92g5eiqb_fo",
                    "Kdwyqctp908",
                    "-VIM6LSRLIA",
                    "d6wFRZoz8UE",
                    "bkIr9C4DzEA",
                    "neZYcnduRTo"
                  ]
                },
                "180d": {
                  "media_ids": [
                    "5wjsVp3kDO8",
                    "M7KqDsykb3o",
                    "XAv2sKblPRc",
                    "92g5eiqb_fo",
                    "Kdwyqctp908",
                    "-VIM6LSRLIA",
                    "d6wFRZoz8UE",
                    "bkIr9C4DzEA",
                    "neZYcnduRTo"
                  ]
                },
                "365d": {
                  "media_ids": [
                    "5wjsVp3kDO8",
                    "M7KqDsykb3o",
                    "XAv2sKblPRc",
                    "92g5eiqb_fo",
                    "Kdwyqctp908",
                    "-VIM6LSRLIA",
                    "d6wFRZoz8UE",
                    "bkIr9C4DzEA",
                    "neZYcnduRTo"
                  ]
                },
                "all": {
                  "media_ids": [
                    "5wjsVp3kDO8",
                    "M7KqDsykb3o",
                    "XAv2sKblPRc",
                    "92g5eiqb_fo",
                    "Kdwyqctp908",
                    "-VIM6LSRLIA",
                    "d6wFRZoz8UE",
                    "bkIr9C4DzEA",
                    "neZYcnduRTo"
                  ]
                }
              }
            },
            "engagement_desc": {
              "performance": {
                "7d": {
                  "media_ids": [
                    "Kdwyqctp908",
                    "XAv2sKblPRc",
                    "5wjsVp3kDO8",
                    "92g5eiqb_fo",
                    "M7KqDsykb3o",
                    "-VIM6LSRLIA"
                  ]
                },
                "30d": {
                  "media_ids": [
                    "Kdwyqctp908",
                    "d6wFRZoz8UE",
                    "XAv2sKblPRc",
                    "LyRIu-CYBdA",
                    "5wjsVp3kDO8",
                    "TQcqOW39ksk",
                    "92g5eiqb_fo",
                    "M7KqDsykb3o",
                    "neZYcnduRTo"
                  ]
                },
                "90d": {
                  "media_ids": [
                    "Kdwyqctp908",
                    "QD2XDoeT8SI",
                    "X8n5OA1m5o8",
                    "0uWzj4AiiZ8",
                    "NpHFB_DYXhY",
                    "wbFVknTGTvk",
                    "d6wFRZoz8UE",
                    "RrlDv-ts2f0",
                    "TATF8CYTzqc"
                  ]
                },
                "180d": {
                  "media_ids": [
                    "KG6SL6Mf7ak",
                    "Kdwyqctp908",
                    "QD2XDoeT8SI",
                    "S2U3a1xXv8k",
                    "mjnGe-zLhcM",
                    "X8n5OA1m5o8",
                    "0uWzj4AiiZ8",
                    "ZTvggR94UnA",
                    "wS4z42KaeGk"
                  ]
                },
                "365d": {
                  "media_ids": [
                    "CMLD0Lp0JBg",
                    "K6rUDI0MVXI",
                    "BvWtNx3VOUA",
                    "xzZPzmMtQA8",
                    "KG6SL6Mf7ak",
                    "Kdwyqctp908",
                    "S_3Dl9x8MG0",
                    "KjBisqblTLQ",
                    "qxMqWHCTqGM"
                  ]
                },
                "all": {
                  "media_ids": [
                    "vl6jn-DdafM",
                    "gm0b_ijaYMQ",
                    "_T8cn2J13-4",
                    "4czjS9h4Fpg",
                    "pyNl87mXOkc",
                    "Aymrnzianf0",
                    "pMsvr55cTZ0",
                    "CMLD0Lp0JBg",
                    "7nT7JGZMbtM"
                  ]
                }
              }
            },
            "views_count_desc": {
              "performance": {
                "7d": {
                  "media_ids": [
                    "Kdwyqctp908",
                    "XAv2sKblPRc",
                    "5wjsVp3kDO8",
                    "-VIM6LSRLIA",
                    "M7KqDsykb3o",
                    "92g5eiqb_fo"
                  ]
                },
                "30d": {
                  "media_ids": [
                    "Kdwyqctp908",
                    "XAv2sKblPRc",
                    "neZYcnduRTo",
                    "d6F9o6LKpVA",
                    "LyRIu-CYBdA",
                    "5wjsVp3kDO8",
                    "Rs71YCXrXpg",
                    "TQcqOW39ksk",
                    "bkIr9C4DzEA"
                  ]
                },
                "90d": {
                  "media_ids": [
                    "Kdwyqctp908",
                    "QD2XDoeT8SI",
                    "X8n5OA1m5o8",
                    "NpHFB_DYXhY",
                    "XAv2sKblPRc",
                    "LapcNp5La48",
                    "wbFVknTGTvk",
                    "0uWzj4AiiZ8",
                    "neZYcnduRTo"
                  ]
                },
                "180d": {
                  "media_ids": [
                    "KG6SL6Mf7ak",
                    "Kdwyqctp908",
                    "QD2XDoeT8SI",
                    "S2U3a1xXv8k",
                    "Z_h-ho2w_0Y",
                    "wS4z42KaeGk",
                    "X8n5OA1m5o8",
                    "NpHFB_DYXhY",
                    "ZTvggR94UnA"
                  ]
                },
                "365d": {
                  "media_ids": [
                    "CMLD0Lp0JBg",
                    "KG6SL6Mf7ak",
                    "xzZPzmMtQA8",
                    "BvWtNx3VOUA",
                    "K6rUDI0MVXI",
                    "S_3Dl9x8MG0",
                    "xAieE-QtOeM",
                    "Kdwyqctp908",
                    "5oeJJDGJQiM"
                  ]
                },
                "all": {
                  "media_ids": [
                    "gm0b_ijaYMQ",
                    "EJxwWpaGoJs",
                    "pMsvr55cTZ0",
                    "Aymrnzianf0",
                    "S9HdPi9Ikhk",
                    "4czjS9h4Fpg",
                    "vl6jn-DdafM",
                    "pyNl87mXOkc",
                    "7nT7JGZMbtM"
                  ]
                }
              }
            },
            "comments_count_desc": {
              "performance": {
                "7d": {
                  "media_ids": [
                    "-VIM6LSRLIA",
                    "Kdwyqctp908",
                    "92g5eiqb_fo",
                    "XAv2sKblPRc",
                    "M7KqDsykb3o",
                    "5wjsVp3kDO8"
                  ]
                },
                "30d": {
                  "media_ids": [
                    "fwBBFmINkpw",
                    "Rs71YCXrXpg",
                    "zPHtJLt_rz4",
                    "inSBC5U8KT4",
                    "TQcqOW39ksk",
                    "LyRIu-CYBdA",
                    "6g9_kyHTaYI",
                    "neZYcnduRTo",
                    "ZSHnE8Pd5s4"
                  ]
                },
                "90d": {
                  "media_ids": [
                    "2aVWZOFrjdc",
                    "CcWEts59a6o",
                    "TATF8CYTzqc",
                    "olPdP9zMegE",
                    "y__vwRQ3PVg",
                    "cNV_GlKcjUc",
                    "LlW-q5ALGc8",
                    "wbFVknTGTvk",
                    "yJUJmI8YI_E"
                  ]
                },
                "180d": {
                  "media_ids": [
                    "ugwa3g9jCiA",
                    "S2U3a1xXv8k",
                    "dak8uzKba4k",
                    "uFfFsOu7yqY",
                    "mjnGe-zLhcM",
                    "dH_VIeB8jvU",
                    "_r1aWHWJCUU",
                    "jrDv0OdMt5s",
                    "ZTvggR94UnA"
                  ]
                },
                "365d": {
                  "media_ids": [
                    "HbDsM6c0R5Y",
                    "Fd3sh_gTl1c",
                    "7LF59gmJNog",
                    "PS-ps_rVNYc",
                    "WvcSc-SicW4",
                    "6GX2KBgK0CQ",
                    "1XyTjY69umQ",
                    "eeuNZTpMdWA",
                    "29dr_l3-9lU"
                  ]
                },
                "all": {
                  "media_ids": [
                    "_T8cn2J13-4",
                    "4czjS9h4Fpg",
                    "mB1nAzriqRQ",
                    "_fRSaLAEW2s",
                    "WeA7edXsU40",
                    "llbIzbOStt4",
                    "pyNl87mXOkc",
                    "FlpstXNjImY",
                    "iR3oXFFISI0"
                  ]
                }
              }
            },
            "last_media": "5wjsVp3kDO8"
          }
        },
        "blogger_rankings": {
          "data": {
            "worldwide": {
              "rank": 128219,
              "delta": 0
            },
            "country": {
              "rank": 43181,
              "country": {
                "id": 6252001,
                "code": "us",
                "title": "United States"
              }
            },
            "category": {
              "rank": 717,
              "country": {
                "id": 6252001,
                "code": "us",
                "title": "United States"
              },
              "category": {
                "id": 21,
                "title": "Science & Technology"
              }
            },
            "countries": [
              {
                "rank": 43181,
                "country": {
                  "id": 6252001,
                  "code": "us",
                  "title": "United States"
                }
              }
            ],
            "categories": [
              {
                "category": {
                  "id": 21,
                  "title": "Science & Technology"
                },
                "countries": [
                  {
                    "rank": 717,
                    "country": {
                      "id": 6252001,
                      "code": "us",
                      "title": "United States"
                    }
                  }
                ]
              },
              {
                "category": {
                  "id": 19,
                  "title": "News & Politics"
                },
                "countries": [
                  {
                    "rank": 1779,
                    "country": {
                      "id": 6252001,
                      "code": "us",
                      "title": "United States"
                    }
                  }
                ]
              }
            ]
          },
          "status": {
            "code": "OK"
          },
          "confidence": {
            "model_version": "2022-02-08",
            "value": 100,
            "is_low_confidence": false
          }
        },
        "social_networks": {
          "data": [
            {
              "type": 1,
              "title": "NASA",
              "social_id": "528817151",
              "username": "nasa",
              "avatar_url": "https://cdn.hypeauditor.com/img/instagram/user/528817151.jpg?w=150&till=1696564800&sign=62de5e9cafa96da0fb39f3c771d13794",
              "subscribers_count": 96244843,
              "er": 0.653114,
              "state": "READY"
            },
            {
              "type": 5,
              "title": "NASA",
              "social_id": "11348282",
              "username": "nasa",
              "avatar_url": "https://pbs.twimg.com/profile_images/1321163587679784960/0ZxKlEKB_400x400.jpg",
              "subscribers_count": 77256135,
              "er": 0.003357,
              "state": "READY"
            },
            {
              "type": 2,
              "title": "NASA",
              "social_id": "UCLA_DiR1FfKNvjuUpBHmylQ",
              "username": "NASA",
              "avatar_url": "https://yt3.googleusercontent.com/2kw8s66dhLUegJ3XrqZSkZMfp77CRhCfYm1NurDwDB2L9sT_-CaoUix_iWjoE_t66b07JzoR=s900-c-k-c0x00ffffff-no-rj",
              "subscribers_count": 11454597,
              "er": 2.83,
              "state": "READY"
            },
            {
              "type": 1,
              "title": "NASA Artemis",
              "social_id": "1104426670",
              "username": "nasaartemis",
              "avatar_url": "https://cdn.hypeauditor.com/img/instagram/user/1104426670.jpg?w=150&till=1696564800&sign=be638226d27bd3595be2db89a7df8f84",
              "subscribers_count": 2882917,
              "er": 1.391924,
              "state": "READY"
            },
            {
              "type": 2,
              "title": "NASA Video",
              "social_id": "UC_aP7p621ATY_yAa8jMqUVA",
              "username": "NASAgovVideo",
              "avatar_url": "https://yt3.googleusercontent.com/ytc/APkrFKaxOlqkYjIflUrnjBxwVmK-q8M1Ll9Dc-44Ccrxgw=s900-c-k-c0x00ffffff-no-rj",
              "subscribers_count": 946474,
              "er": 3.62,
              "state": "READY_LOW_CONFIDENCE"
            }
          ]
        },
        "cqs": {
          "data": {
            "value": 46,
            "mark": "average",
            "display_mark": "Average",
            "value_description": {
              "creator": {
                "value": 5
              },
              "audience": {
                "value": 5
              },
              "credibility": {
                "value": 4
              },
              "engagement": {
                "value": 1
              }
            }
          }
        }
      },
      "video_integration_price": {
        "data": {
          "price": 1490,
          "price_from": 500,
          "price_to": 5000
        }
      }
    },
    "features": [],
    "metrics_history": {
      "videos_v30": {
        "history": [
          {
            "time": 1537228800,
            "value": 111358,
            "time_iso": "2018-09-18T00:00:00"
          },
          {
            "time": 1538352000,
            "value": 74753,
            "time_iso": "2018-10-01T00:00:00"
          },
          {
            "time": 1539561600,
            "value": 81233,
            "time_iso": "2018-10-15T00:00:00"
          },
          {
            "time": 1540252800,
            "value": 66797,
            "time_iso": "2018-10-23T00:00:00"
          },
          {
            "time": 1541030400,
            "value": 30974,
            "time_iso": "2018-11-01T00:00:00"
          },
          {
            "time": 1542240000,
            "value": 43981,
            "time_iso": "2018-11-15T00:00:00"
          },
          {
            "time": 1543017600,
            "value": 49734,
            "time_iso": "2018-11-24T00:00:00"
          },
          {
            "time": 1544486400,
            "value": 80478,
            "time_iso": "2018-12-11T00:00:00"
          },
          {
            "time": 1548892800,
            "value": 55913,
            "time_iso": "2019-01-31T00:00:00"
          },
          {
            "time": 1550793600,
            "value": 76090,
            "time_iso": "2019-02-22T00:00:00"
          },
          {
            "time": 1551916800,
            "value": 74502,
            "time_iso": "2019-03-07T00:00:00"
          },
          {
            "time": 1552867200,
            "value": 59160,
            "time_iso": "2019-03-18T00:00:00"
          },
          {
            "time": 1553904000,
            "value": 43316,
            "time_iso": "2019-03-30T00:00:00"
          },
          {
            "time": 1555286400,
            "value": 33619,
            "time_iso": "2019-04-15T00:00:00"
          },
          {
            "time": 1556496000,
            "value": 32798,
            "time_iso": "2019-04-29T00:00:00"
          },
          {
            "time": 1558137600,
            "value": 54970,
            "time_iso": "2019-05-18T00:00:00"
          },
          {
            "time": 1559692800,
            "value": 125991,
            "time_iso": "2019-06-05T00:00:00"
          },
          {
            "time": 1561680000,
            "value": 63674,
            "time_iso": "2019-06-28T00:00:00"
          },
          {
            "time": 1563235200,
            "value": 80018,
            "time_iso": "2019-07-16T00:00:00"
          },
          {
            "time": 1564012800,
            "value": 98929,
            "time_iso": "2019-07-25T00:00:00"
          },
          {
            "time": 1565049600,
            "value": 48433,
            "time_iso": "2019-08-06T00:00:00"
          },
          {
            "time": 1567209600,
            "value": 46396,
            "time_iso": "2019-08-31T00:00:00"
          },
          {
            "time": 1567814400,
            "value": 79026,
            "time_iso": "2019-09-07T00:00:00"
          },
          {
            "time": 1569456000,
            "value": 81233,
            "time_iso": "2019-09-26T00:00:00"
          },
          {
            "time": 1570406400,
            "value": 81233,
            "time_iso": "2019-10-07T00:00:00"
          },
          {
            "time": 1571184000,
            "value": 81233,
            "time_iso": "2019-10-16T00:00:00"
          },
          {
            "time": 1571961600,
            "value": 81233,
            "time_iso": "2019-10-25T00:00:00"
          },
          {
            "time": 1573171200,
            "value": 69520,
            "time_iso": "2019-11-08T00:00:00"
          },
          {
            "time": 1574899200,
            "value": 46258,
            "time_iso": "2019-11-28T00:00:00"
          },
          {
            "time": 1575849600,
            "value": 60714,
            "time_iso": "2019-12-09T00:00:00"
          },
          {
            "time": 1577232000,
            "value": 158691,
            "time_iso": "2019-12-25T00:00:00"
          },
          {
            "time": 1579046400,
            "value": 210198,
            "time_iso": "2020-01-15T00:00:00"
          },
          {
            "time": 1580083200,
            "value": 85086,
            "time_iso": "2020-01-27T00:00:00"
          },
          {
            "time": 1581206400,
            "value": 58998,
            "time_iso": "2020-02-09T00:00:00"
          },
          {
            "time": 1582070400,
            "value": 72716,
            "time_iso": "2020-02-19T00:00:00"
          },
          {
            "time": 1583020800,
            "value": 46627,
            "time_iso": "2020-03-01T00:00:00"
          },
          {
            "time": 1583712000,
            "value": 66500,
            "time_iso": "2020-03-09T00:00:00"
          },
          {
            "time": 1585180800,
            "value": 86206,
            "time_iso": "2020-03-26T00:00:00"
          },
          {
            "time": 1586476800,
            "value": 76063,
            "time_iso": "2020-04-10T00:00:00"
          },
          {
            "time": 1587600000,
            "value": 114715,
            "time_iso": "2020-04-23T00:00:00"
          },
          {
            "time": 1588723200,
            "value": 85434,
            "time_iso": "2020-05-06T00:00:00"
          },
          {
            "time": 1589673600,
            "value": 70366,
            "time_iso": "2020-05-17T00:00:00"
          },
          {
            "time": 1590624000,
            "value": 69827,
            "time_iso": "2020-05-28T00:00:00"
          },
          {
            "time": 1591315200,
            "value": 759551,
            "time_iso": "2020-06-05T00:00:00"
          },
          {
            "time": 1593129600,
            "value": 168773,
            "time_iso": "2020-06-26T00:00:00"
          },
          {
            "time": 1594339200,
            "value": 138014,
            "time_iso": "2020-07-10T00:00:00"
          },
          {
            "time": 1595289600,
            "value": 182724,
            "time_iso": "2020-07-21T00:00:00"
          },
          {
            "time": 1596067200,
            "value": 87415,
            "time_iso": "2020-07-30T00:00:00"
          },
          {
            "time": 1596758400,
            "value": 81233,
            "time_iso": "2020-08-07T00:00:00"
          },
          {
            "time": 1598227200,
            "value": 83715,
            "time_iso": "2020-08-24T00:00:00"
          },
          {
            "time": 1599782400,
            "value": 86057,
            "time_iso": "2020-09-11T00:00:00"
          },
          {
            "time": 1601078400,
            "value": 97254,
            "time_iso": "2020-09-26T00:00:00"
          },
          {
            "time": 1602201600,
            "value": 87456,
            "time_iso": "2020-10-09T00:00:00"
          },
          {
            "time": 1603238400,
            "value": 81323,
            "time_iso": "2020-10-21T00:00:00"
          },
          {
            "time": 1604620800,
            "value": 99847,
            "time_iso": "2020-11-06T00:00:00"
          },
          {
            "time": 1605484800,
            "value": 80946,
            "time_iso": "2020-11-16T00:00:00"
          },
          {
            "time": 1606780800,
            "value": 139222,
            "time_iso": "2020-12-01T00:00:00"
          },
          {
            "time": 1607644800,
            "value": 75370,
            "time_iso": "2020-12-11T00:00:00"
          },
          {
            "time": 1609200000,
            "value": 50320,
            "time_iso": "2020-12-29T00:00:00"
          },
          {
            "time": 1611273600,
            "value": 160856,
            "time_iso": "2021-01-22T00:00:00"
          },
          {
            "time": 1612310400,
            "value": 108591,
            "time_iso": "2021-02-03T00:00:00"
          },
          {
            "time": 1613347200,
            "value": 81233,
            "time_iso": "2021-02-15T00:00:00"
          },
          {
            "time": 1614124800,
            "value": 178916,
            "time_iso": "2021-02-24T00:00:00"
          },
          {
            "time": 1614902400,
            "value": 594234,
            "time_iso": "2021-03-05T00:00:00"
          },
          {
            "time": 1616630400,
            "value": 256115,
            "time_iso": "2021-03-25T00:00:00"
          },
          {
            "time": 1617840000,
            "value": 88716,
            "time_iso": "2021-04-08T00:00:00"
          },
          {
            "time": 1618704000,
            "value": 81233,
            "time_iso": "2021-04-18T00:00:00"
          },
          {
            "time": 1619395200,
            "value": 88029,
            "time_iso": "2021-04-26T00:00:00"
          },
          {
            "time": 1620086400,
            "value": 176111,
            "time_iso": "2021-05-04T00:00:00"
          },
          {
            "time": 1621555200,
            "value": 92441,
            "time_iso": "2021-05-21T00:00:00"
          },
          {
            "time": 1623369600,
            "value": 108312,
            "time_iso": "2021-06-11T00:00:00"
          },
          {
            "time": 1624406400,
            "value": 57952,
            "time_iso": "2021-06-23T00:00:00"
          },
          {
            "time": 1626048000,
            "value": 63610,
            "time_iso": "2021-07-12T00:00:00"
          },
          {
            "time": 1626998400,
            "value": 63283,
            "time_iso": "2021-07-23T00:00:00"
          },
          {
            "time": 1628553600,
            "value": 96343,
            "time_iso": "2021-08-10T00:00:00"
          },
          {
            "time": 1629849600,
            "value": 90637,
            "time_iso": "2021-08-25T00:00:00"
          },
          {
            "time": 1631232000,
            "value": 101600,
            "time_iso": "2021-09-10T00:00:00"
          },
          {
            "time": 1632700800,
            "value": 120142,
            "time_iso": "2021-09-27T00:00:00"
          },
          {
            "time": 1634256000,
            "value": 57125,
            "time_iso": "2021-10-15T00:00:00"
          },
          {
            "time": 1635379200,
            "value": 47834,
            "time_iso": "2021-10-28T00:00:00"
          },
          {
            "time": 1636329600,
            "value": 39990,
            "time_iso": "2021-11-08T00:00:00"
          },
          {
            "time": 1637107200,
            "value": 102899,
            "time_iso": "2021-11-17T00:00:00"
          },
          {
            "time": 1638403200,
            "value": 67641,
            "time_iso": "2021-12-02T00:00:00"
          },
          {
            "time": 1639526400,
            "value": 66711,
            "time_iso": "2021-12-15T00:00:00"
          },
          {
            "time": 1641081600,
            "value": 84365,
            "time_iso": "2022-01-02T00:00:00"
          },
          {
            "time": 1642723200,
            "value": 397381,
            "time_iso": "2022-01-21T00:00:00"
          },
          {
            "time": 1644537600,
            "value": 267437,
            "time_iso": "2022-02-11T00:00:00"
          },
          {
            "time": 1646956800,
            "value": 74254,
            "time_iso": "2022-03-11T00:00:00"
          },
          {
            "time": 1647993600,
            "value": 87267,
            "time_iso": "2022-03-23T00:00:00"
          },
          {
            "time": 1649116800,
            "value": 88322,
            "time_iso": "2022-04-05T00:00:00"
          },
          {
            "time": 1651104000,
            "value": 59849,
            "time_iso": "2022-04-28T00:00:00"
          },
          {
            "time": 1652400000,
            "value": 77391,
            "time_iso": "2022-05-13T00:00:00"
          },
          {
            "time": 1652745600,
            "value": 48223,
            "time_iso": "2022-05-17T00:00:00"
          }
        ]
      },
      "er": {
        "history": [
          {
            "value": 2.83,
            "time_iso": "2023-10-04T00:00:00"
          },
          {
            "value": 3.39,
            "time_iso": "2023-09-21T00:00:00"
          },
          {
            "value": 3.43,
            "time_iso": "2023-09-19T00:00:00"
          },
          {
            "value": 3.46,
            "time_iso": "2023-09-17T00:00:00"
          },
          {
            "value": 3.41,
            "time_iso": "2023-09-15T00:00:00"
          },
          {
            "value": 3.38,
            "time_iso": "2023-09-13T00:00:00"
          },
          {
            "value": 3.39,
            "time_iso": "2023-09-11T00:00:00"
          },
          {
            "value": 3.42,
            "time_iso": "2023-09-09T00:00:00"
          }
        ]
      },
      "subscribers_count": {
        "value": 11400000,
        "history": [
          {
            "time": 1483228800,
            "value": 1092371,
            "datetime": "2017-01-01T00:00:00",
            "time_iso": "2017-01-01T00:00:00"
          },
          {
            "time": 1483315200,
            "value": 1093141,
            "datetime": "2017-01-02T00:00:00",
            "time_iso": "2017-01-02T00:00:00"
          },
          {
            "time": 1483401600,
            "value": 1093983,
            "datetime": "2017-01-03T00:00:00",
            "time_iso": "2017-01-03T00:00:00"
          },
          {
            "time": 1483488000,
            "value": 1094846,
            "datetime": "2017-01-04T00:00:00",
            "time_iso": "2017-01-04T00:00:00"
          },
          {
            "time": 1483574400,
            "value": 1095608,
            "datetime": "2017-01-05T00:00:00",
            "time_iso": "2017-01-05T00:00:00"
          },
          {
            "time": 1483660800,
            "value": 1096766,
            "datetime": "2017-01-06T00:00:00",
            "time_iso": "2017-01-06T00:00:00"
          },
          {
            "time": 1483747200,
            "value": 1097662,
            "datetime": "2017-01-07T00:00:00",
            "time_iso": "2017-01-07T00:00:00"
          },
          {
            "time": 1483833600,
            "value": 1098480,
            "datetime": "2017-01-08T00:00:00",
            "time_iso": "2017-01-08T00:00:00"
          },
          {
            "time": 1483920000,
            "value": 1099217,
            "datetime": "2017-01-09T00:00:00",
            "time_iso": "2017-01-09T00:00:00"
          },
          {
            "time": 1484006400,
            "value": 1099914,
            "datetime": "2017-01-10T00:00:00",
            "time_iso": "2017-01-10T00:00:00"
          },
          {
            "time": 1484092800,
            "value": 1100714,
            "datetime": "2017-01-11T00:00:00",
            "time_iso": "2017-01-11T00:00:00"
          },
          {
            "time": 1484179200,
            "value": 1101672,
            "datetime": "2017-01-12T00:00:00",
            "time_iso": "2017-01-12T00:00:00"
          },
          {
            "time": 1484265600,
            "value": 1102612,
            "datetime": "2017-01-13T00:00:00",
            "time_iso": "2017-01-13T00:00:00"
          },
          {
            "time": 1484352000,
            "value": 1103618,
            "datetime": "2017-01-14T00:00:00",
            "time_iso": "2017-01-14T00:00:00"
          },
          {
            "time": 1484438400,
            "value": 1104558,
            "datetime": "2017-01-15T00:00:00",
            "time_iso": "2017-01-15T00:00:00"
          },
          {
            "time": 1484524800,
            "value": 1105312,
            "datetime": "2017-01-16T00:00:00",
            "time_iso": "2017-01-16T00:00:00"
          },
          {
            "time": 1484611200,
            "value": 1105946,
            "datetime": "2017-01-17T00:00:00",
            "time_iso": "2017-01-17T00:00:00"
          },
          {
            "time": 1484697600,
            "value": 1106786,
            "datetime": "2017-01-18T00:00:00",
            "time_iso": "2017-01-18T00:00:00"
          },
          {
            "time": 1484784000,
            "value": 1107643,
            "datetime": "2017-01-19T00:00:00",
            "time_iso": "2017-01-19T00:00:00"
          },
          {
            "time": 1484870400,
            "value": 1108463,
            "datetime": "2017-01-20T00:00:00",
            "time_iso": "2017-01-20T00:00:00"
          },
          {
            "time": 1484956800,
            "value": 1109189,
            "datetime": "2017-01-21T00:00:00",
            "time_iso": "2017-01-21T00:00:00"
          },
          {
            "time": 1485043200,
            "value": 1110035,
            "datetime": "2017-01-22T00:00:00",
            "time_iso": "2017-01-22T00:00:00"
          },
          {
            "time": 1485129600,
            "value": 1110979,
            "datetime": "2017-01-23T00:00:00",
            "time_iso": "2017-01-23T00:00:00"
          },
          {
            "time": 1485216000,
            "value": 1111736,
            "datetime": "2017-01-24T00:00:00",
            "time_iso": "2017-01-24T00:00:00"
          },
          {
            "time": 1485302400,
            "value": 1112489,
            "datetime": "2017-01-25T00:00:00",
            "time_iso": "2017-01-25T00:00:00"
          },
          {
            "time": 1485388800,
            "value": 1112948,
            "datetime": "2017-01-26T00:00:00",
            "time_iso": "2017-01-26T00:00:00"
          },
          {
            "time": 1485475200,
            "value": 1113774,
            "datetime": "2017-01-27T00:00:00",
            "time_iso": "2017-01-27T00:00:00"
          },
          {
            "time": 1485561600,
            "value": 1114681,
            "datetime": "2017-01-28T00:00:00",
            "time_iso": "2017-01-28T00:00:00"
          },
          {
            "time": 1485648000,
            "value": 1116518,
            "datetime": "2017-01-29T00:00:00",
            "time_iso": "2017-01-29T00:00:00"
          },
          {
            "time": 1485734400,
            "value": 1117690,
            "datetime": "2017-01-30T00:00:00",
            "time_iso": "2017-01-30T00:00:00"
          },
          {
            "time": 1485820800,
            "value": 1118567,
            "datetime": "2017-01-31T00:00:00",
            "time_iso": "2017-01-31T00:00:00"
          },
          {
            "time": 1485907200,
            "value": 1119369,
            "datetime": "2017-02-01T00:00:00",
            "time_iso": "2017-02-01T00:00:00"
          },
          {
            "time": 1485993600,
            "value": 1120312,
            "datetime": "2017-02-02T00:00:00",
            "time_iso": "2017-02-02T00:00:00"
          },
          {
            "time": 1486080000,
            "value": 1121019,
            "datetime": "2017-02-03T00:00:00",
            "time_iso": "2017-02-03T00:00:00"
          },
          {
            "time": 1486166400,
            "value": 1121822,
            "datetime": "2017-02-04T00:00:00",
            "time_iso": "2017-02-04T00:00:00"
          },
          {
            "time": 1486252800,
            "value": 1122650,
            "datetime": "2017-02-05T00:00:00",
            "time_iso": "2017-02-05T00:00:00"
          },
          {
            "time": 1486339200,
            "value": 1123446,
            "datetime": "2017-02-06T00:00:00",
            "time_iso": "2017-02-06T00:00:00"
          },
          {
            "time": 1486425600,
            "value": 1124153,
            "datetime": "2017-02-07T00:00:00",
            "time_iso": "2017-02-07T00:00:00"
          },
          {
            "time": 1486512000,
            "value": 1125632,
            "datetime": "2017-02-08T00:00:00",
            "time_iso": "2017-02-08T00:00:00"
          },
          {
            "time": 1486598400,
            "value": 1126797,
            "datetime": "2017-02-09T00:00:00",
            "time_iso": "2017-02-09T00:00:00"
          },
          {
            "time": 1486684800,
            "value": 1127962,
            "datetime": "2017-02-10T00:00:00",
            "time_iso": "2017-02-10T00:00:00"
          },
          {
            "time": 1486771200,
            "value": 1129104,
            "datetime": "2017-02-11T00:00:00",
            "time_iso": "2017-02-11T00:00:00"
          },
          {
            "time": 1486857600,
            "value": 1130056,
            "datetime": "2017-02-12T00:00:00",
            "time_iso": "2017-02-12T00:00:00"
          },
          {
            "time": 1486944000,
            "value": 1130994,
            "datetime": "2017-02-13T00:00:00",
            "time_iso": "2017-02-13T00:00:00"
          },
          {
            "time": 1487030400,
            "value": 1131892,
            "datetime": "2017-02-14T00:00:00",
            "time_iso": "2017-02-14T00:00:00"
          },
          {
            "time": 1487116800,
            "value": 1132945,
            "datetime": "2017-02-15T00:00:00",
            "time_iso": "2017-02-15T00:00:00"
          },
          {
            "time": 1487203200,
            "value": 1134187,
            "datetime": "2017-02-16T00:00:00",
            "time_iso": "2017-02-16T00:00:00"
          },
          {
            "time": 1487289600,
            "value": 1135124,
            "datetime": "2017-02-17T00:00:00",
            "time_iso": "2017-02-17T00:00:00"
          },
          {
            "time": 1487376000,
            "value": 1137123,
            "datetime": "2017-02-18T00:00:00",
            "time_iso": "2017-02-18T00:00:00"
          },
          {
            "time": 1487462400,
            "value": 1139360,
            "datetime": "2017-02-19T00:00:00",
            "time_iso": "2017-02-19T00:00:00"
          },
          {
            "time": 1487548800,
            "value": 1140665,
            "datetime": "2017-02-20T00:00:00",
            "time_iso": "2017-02-20T00:00:00"
          },
          {
            "time": 1487635200,
            "value": 1142502,
            "datetime": "2017-02-21T00:00:00",
            "time_iso": "2017-02-21T00:00:00"
          },
          {
            "time": 1487721600,
            "value": 1154414,
            "datetime": "2017-02-22T00:00:00",
            "time_iso": "2017-02-22T00:00:00"
          },
          {
            "time": 1487808000,
            "value": 1163475,
            "datetime": "2017-02-23T00:00:00",
            "time_iso": "2017-02-23T00:00:00"
          },
          {
            "time": 1487894400,
            "value": 1167128,
            "datetime": "2017-02-24T00:00:00",
            "time_iso": "2017-02-24T00:00:00"
          },
          {
            "time": 1487980800,
            "value": 1170235,
            "datetime": "2017-02-25T00:00:00",
            "time_iso": "2017-02-25T00:00:00"
          },
          {
            "time": 1488067200,
            "value": 1172930,
            "datetime": "2017-02-26T00:00:00",
            "time_iso": "2017-02-26T00:00:00"
          },
          {
            "time": 1488153600,
            "value": 1174750,
            "datetime": "2017-02-27T00:00:00",
            "time_iso": "2017-02-27T00:00:00"
          },
          {
            "time": 1488240000,
            "value": 1176406,
            "datetime": "2017-02-28T00:00:00",
            "time_iso": "2017-02-28T00:00:00"
          },
          {
            "time": 1488326400,
            "value": 1177853,
            "datetime": "2017-03-01T00:00:00",
            "time_iso": "2017-03-01T00:00:00"
          },
          {
            "time": 1488412800,
            "value": 1179115,
            "datetime": "2017-03-02T00:00:00",
            "time_iso": "2017-03-02T00:00:00"
          },
          {
            "time": 1488499200,
            "value": 1180100,
            "datetime": "2017-03-03T00:00:00",
            "time_iso": "2017-03-03T00:00:00"
          },
          {
            "time": 1488585600,
            "value": 1181318,
            "datetime": "2017-03-04T00:00:00",
            "time_iso": "2017-03-04T00:00:00"
          },
          {
            "time": 1488672000,
            "value": 1182564,
            "datetime": "2017-03-05T00:00:00",
            "time_iso": "2017-03-05T00:00:00"
          },
          {
            "time": 1488758400,
            "value": 1183597,
            "datetime": "2017-03-06T00:00:00",
            "time_iso": "2017-03-06T00:00:00"
          },
          {
            "time": 1488844800,
            "value": 1184578,
            "datetime": "2017-03-07T00:00:00",
            "time_iso": "2017-03-07T00:00:00"
          },
          {
            "time": 1488931200,
            "value": 1185435,
            "datetime": "2017-03-08T00:00:00",
            "time_iso": "2017-03-08T00:00:00"
          },
          {
            "time": 1489017600,
            "value": 1186345,
            "datetime": "2017-03-09T00:00:00",
            "time_iso": "2017-03-09T00:00:00"
          },
          {
            "time": 1489104000,
            "value": 1187110,
            "datetime": "2017-03-10T00:00:00",
            "time_iso": "2017-03-10T00:00:00"
          },
          {
            "time": 1489190400,
            "value": 1188178,
            "datetime": "2017-03-11T00:00:00",
            "time_iso": "2017-03-11T00:00:00"
          },
          {
            "time": 1489276800,
            "value": 1189356,
            "datetime": "2017-03-12T00:00:00",
            "time_iso": "2017-03-12T00:00:00"
          },
          {
            "time": 1489363200,
            "value": 1190228,
            "datetime": "2017-03-13T00:00:00",
            "time_iso": "2017-03-13T00:00:00"
          },
          {
            "time": 1489449600,
            "value": 1191131,
            "datetime": "2017-03-14T00:00:00",
            "time_iso": "2017-03-14T00:00:00"
          },
          {
            "time": 1489536000,
            "value": 1192558,
            "datetime": "2017-03-15T00:00:00",
            "time_iso": "2017-03-15T00:00:00"
          },
          {
            "time": 1489622400,
            "value": 1193710,
            "datetime": "2017-03-16T00:00:00",
            "time_iso": "2017-03-16T00:00:00"
          },
          {
            "time": 1489708800,
            "value": 1194821,
            "datetime": "2017-03-17T00:00:00",
            "time_iso": "2017-03-17T00:00:00"
          },
          {
            "time": 1489795200,
            "value": 1195931,
            "datetime": "2017-03-18T00:00:00",
            "time_iso": "2017-03-18T00:00:00"
          },
          {
            "time": 1489881600,
            "value": 1197173,
            "datetime": "2017-03-19T00:00:00",
            "time_iso": "2017-03-19T00:00:00"
          },
          {
            "time": 1489968000,
            "value": 1198150,
            "datetime": "2017-03-20T00:00:00",
            "time_iso": "2017-03-20T00:00:00"
          },
          {
            "time": 1490054400,
            "value": 1198874,
            "datetime": "2017-03-21T00:00:00",
            "time_iso": "2017-03-21T00:00:00"
          },
          {
            "time": 1490140800,
            "value": 1199700,
            "datetime": "2017-03-22T00:00:00",
            "time_iso": "2017-03-22T00:00:00"
          },
          {
            "time": 1490227200,
            "value": 1200439,
            "datetime": "2017-03-23T00:00:00",
            "time_iso": "2017-03-23T00:00:00"
          },
          {
            "time": 1490313600,
            "value": 1201902,
            "datetime": "2017-03-24T00:00:00",
            "time_iso": "2017-03-24T00:00:00"
          },
          {
            "time": 1490400000,
            "value": 1202867,
            "datetime": "2017-03-25T00:00:00",
            "time_iso": "2017-03-25T00:00:00"
          },
          {
            "time": 1490486400,
            "value": 1203916,
            "datetime": "2017-03-26T00:00:00",
            "time_iso": "2017-03-26T00:00:00"
          },
          {
            "time": 1490572800,
            "value": 1204819,
            "datetime": "2017-03-27T00:00:00",
            "time_iso": "2017-03-27T00:00:00"
          },
          {
            "time": 1490659200,
            "value": 1205660,
            "datetime": "2017-03-28T00:00:00",
            "time_iso": "2017-03-28T00:00:00"
          },
          {
            "time": 1490745600,
            "value": 1206357,
            "datetime": "2017-03-29T00:00:00",
            "time_iso": "2017-03-29T00:00:00"
          },
          {
            "time": 1490832000,
            "value": 1207460,
            "datetime": "2017-03-30T00:00:00",
            "time_iso": "2017-03-30T00:00:00"
          },
          {
            "time": 1490918400,
            "value": 1208341,
            "datetime": "2017-03-31T00:00:00",
            "time_iso": "2017-03-31T00:00:00"
          },
          {
            "time": 1491004800,
            "value": 1209145,
            "datetime": "2017-04-01T00:00:00",
            "time_iso": "2017-04-01T00:00:00"
          },
          {
            "time": 1491091200,
            "value": 1210031,
            "datetime": "2017-04-02T00:00:00",
            "time_iso": "2017-04-02T00:00:00"
          },
          {
            "time": 1491177600,
            "value": 1210571,
            "datetime": "2017-04-03T00:00:00",
            "time_iso": "2017-04-03T00:00:00"
          },
          {
            "time": 1491264000,
            "value": 1211044,
            "datetime": "2017-04-04T00:00:00",
            "time_iso": "2017-04-04T00:00:00"
          },
          {
            "time": 1491350400,
            "value": 1211836,
            "datetime": "2017-04-05T00:00:00",
            "time_iso": "2017-04-05T00:00:00"
          },
          {
            "time": 1491436800,
            "value": 1212676,
            "datetime": "2017-04-06T00:00:00",
            "time_iso": "2017-04-06T00:00:00"
          },
          {
            "time": 1491523200,
            "value": 1213378,
            "datetime": "2017-04-07T00:00:00",
            "time_iso": "2017-04-07T00:00:00"
          },
          {
            "time": 1491609600,
            "value": 1214345,
            "datetime": "2017-04-08T00:00:00",
            "time_iso": "2017-04-08T00:00:00"
          },
          {
            "time": 1491696000,
            "value": 1215349,
            "datetime": "2017-04-09T00:00:00",
            "time_iso": "2017-04-09T00:00:00"
          },
          {
            "time": 1491782400,
            "value": 1216416,
            "datetime": "2017-04-10T00:00:00",
            "time_iso": "2017-04-10T00:00:00"
          },
          {
            "time": 1491868800,
            "value": 1217499,
            "datetime": "2017-04-11T00:00:00",
            "time_iso": "2017-04-11T00:00:00"
          },
          {
            "time": 1491955200,
            "value": 1218575,
            "datetime": "2017-04-12T00:00:00",
            "time_iso": "2017-04-12T00:00:00"
          },
          {
            "time": 1492041600,
            "value": 1220444,
            "datetime": "2017-04-13T00:00:00",
            "time_iso": "2017-04-13T00:00:00"
          },
          {
            "time": 1492128000,
            "value": 1221936,
            "datetime": "2017-04-14T00:00:00",
            "time_iso": "2017-04-14T00:00:00"
          },
          {
            "time": 1492214400,
            "value": 1223299,
            "datetime": "2017-04-15T00:00:00",
            "time_iso": "2017-04-15T00:00:00"
          },
          {
            "time": 1492300800,
            "value": 1224557,
            "datetime": "2017-04-16T00:00:00",
            "time_iso": "2017-04-16T00:00:00"
          },
          {
            "time": 1492387200,
            "value": 1226195,
            "datetime": "2017-04-17T00:00:00",
            "time_iso": "2017-04-17T00:00:00"
          },
          {
            "time": 1492473600,
            "value": 1234384,
            "datetime": "2017-04-18T00:00:00",
            "time_iso": "2017-04-18T00:00:00"
          },
          {
            "time": 1492560000,
            "value": 1235714,
            "datetime": "2017-04-19T00:00:00",
            "time_iso": "2017-04-19T00:00:00"
          },
          {
            "time": 1492646400,
            "value": 1237068,
            "datetime": "2017-04-20T00:00:00",
            "time_iso": "2017-04-20T00:00:00"
          },
          {
            "time": 1492732800,
            "value": 1237903,
            "datetime": "2017-04-21T00:00:00",
            "time_iso": "2017-04-21T00:00:00"
          },
          {
            "time": 1492819200,
            "value": 1239075,
            "datetime": "2017-04-22T00:00:00",
            "time_iso": "2017-04-22T00:00:00"
          },
          {
            "time": 1492905600,
            "value": 1240266,
            "datetime": "2017-04-23T00:00:00",
            "time_iso": "2017-04-23T00:00:00"
          },
          {
            "time": 1492992000,
            "value": 1241119,
            "datetime": "2017-04-24T00:00:00",
            "time_iso": "2017-04-24T00:00:00"
          },
          {
            "time": 1493078400,
            "value": 1242341,
            "datetime": "2017-04-25T00:00:00",
            "time_iso": "2017-04-25T00:00:00"
          },
          {
            "time": 1493164800,
            "value": 1243673,
            "datetime": "2017-04-26T00:00:00",
            "time_iso": "2017-04-26T00:00:00"
          },
          {
            "time": 1493251200,
            "value": 1244715,
            "datetime": "2017-04-27T00:00:00",
            "time_iso": "2017-04-27T00:00:00"
          },
          {
            "time": 1493337600,
            "value": 1245468,
            "datetime": "2017-04-28T00:00:00",
            "time_iso": "2017-04-28T00:00:00"
          },
          {
            "time": 1493424000,
            "value": 1246451,
            "datetime": "2017-04-29T00:00:00",
            "time_iso": "2017-04-29T00:00:00"
          },
          {
            "time": 1493510400,
            "value": 1247449,
            "datetime": "2017-04-30T00:00:00",
            "time_iso": "2017-04-30T00:00:00"
          },
          {
            "time": 1493596800,
            "value": 1248731,
            "datetime": "2017-05-01T00:00:00",
            "time_iso": "2017-05-01T00:00:00"
          },
          {
            "time": 1493683200,
            "value": 1249789,
            "datetime": "2017-05-02T00:00:00",
            "time_iso": "2017-05-02T00:00:00"
          },
          {
            "time": 1493769600,
            "value": 1250818,
            "datetime": "2017-05-03T00:00:00",
            "time_iso": "2017-05-03T00:00:00"
          },
          {
            "time": 1493856000,
            "value": 1252103,
            "datetime": "2017-05-04T00:00:00",
            "time_iso": "2017-05-04T00:00:00"
          },
          {
            "time": 1493942400,
            "value": 1253349,
            "datetime": "2017-05-05T00:00:00",
            "time_iso": "2017-05-05T00:00:00"
          },
          {
            "time": 1494028800,
            "value": 1254725,
            "datetime": "2017-05-06T00:00:00",
            "time_iso": "2017-05-06T00:00:00"
          },
          {
            "time": 1494115200,
            "value": 1256198,
            "datetime": "2017-05-07T00:00:00",
            "time_iso": "2017-05-07T00:00:00"
          },
          {
            "time": 1494201600,
            "value": 1257161,
            "datetime": "2017-05-08T00:00:00",
            "time_iso": "2017-05-08T00:00:00"
          },
          {
            "time": 1494288000,
            "value": 1258113,
            "datetime": "2017-05-09T00:00:00",
            "time_iso": "2017-05-09T00:00:00"
          },
          {
            "time": 1494374400,
            "value": 1260077,
            "datetime": "2017-05-10T00:00:00",
            "time_iso": "2017-05-10T00:00:00"
          },
          {
            "time": 1494460800,
            "value": 1261623,
            "datetime": "2017-05-11T00:00:00",
            "time_iso": "2017-05-11T00:00:00"
          },
          {
            "time": 1494547200,
            "value": 1265909,
            "datetime": "2017-05-12T00:00:00",
            "time_iso": "2017-05-12T00:00:00"
          },
          {
            "time": 1494633600,
            "value": 1268023,
            "datetime": "2017-05-13T00:00:00",
            "time_iso": "2017-05-13T00:00:00"
          },
          {
            "time": 1494720000,
            "value": 1270435,
            "datetime": "2017-05-14T00:00:00",
            "time_iso": "2017-05-14T00:00:00"
          },
          {
            "time": 1494806400,
            "value": 1271642,
            "datetime": "2017-05-15T00:00:00",
            "time_iso": "2017-05-15T00:00:00"
          },
          {
            "time": 1494892800,
            "value": 1272718,
            "datetime": "2017-05-16T00:00:00",
            "time_iso": "2017-05-16T00:00:00"
          },
          {
            "time": 1494979200,
            "value": 1273633,
            "datetime": "2017-05-17T00:00:00",
            "time_iso": "2017-05-17T00:00:00"
          },
          {
            "time": 1495065600,
            "value": 1274271,
            "datetime": "2017-05-18T00:00:00",
            "time_iso": "2017-05-18T00:00:00"
          },
          {
            "time": 1495152000,
            "value": 1275053,
            "datetime": "2017-05-19T00:00:00",
            "time_iso": "2017-05-19T00:00:00"
          },
          {
            "time": 1495238400,
            "value": 1275914,
            "datetime": "2017-05-20T00:00:00",
            "time_iso": "2017-05-20T00:00:00"
          },
          {
            "time": 1495324800,
            "value": 1276847,
            "datetime": "2017-05-21T00:00:00",
            "time_iso": "2017-05-21T00:00:00"
          },
          {
            "time": 1495411200,
            "value": 1277805,
            "datetime": "2017-05-22T00:00:00",
            "time_iso": "2017-05-22T00:00:00"
          },
          {
            "time": 1495497600,
            "value": 1278917,
            "datetime": "2017-05-23T00:00:00",
            "time_iso": "2017-05-23T00:00:00"
          },
          {
            "time": 1495584000,
            "value": 1279808,
            "datetime": "2017-05-24T00:00:00",
            "time_iso": "2017-05-24T00:00:00"
          },
          {
            "time": 1495670400,
            "value": 1280638,
            "datetime": "2017-05-25T00:00:00",
            "time_iso": "2017-05-25T00:00:00"
          },
          {
            "time": 1495756800,
            "value": 1281123,
            "datetime": "2017-05-26T00:00:00",
            "time_iso": "2017-05-26T00:00:00"
          },
          {
            "time": 1495843200,
            "value": 1281817,
            "datetime": "2017-05-27T00:00:00",
            "time_iso": "2017-05-27T00:00:00"
          },
          {
            "time": 1495929600,
            "value": 1282712,
            "datetime": "2017-05-28T00:00:00",
            "time_iso": "2017-05-28T00:00:00"
          },
          {
            "time": 1496016000,
            "value": 1283525,
            "datetime": "2017-05-29T00:00:00",
            "time_iso": "2017-05-29T00:00:00"
          },
          {
            "time": 1496102400,
            "value": 1284378,
            "datetime": "2017-05-30T00:00:00",
            "time_iso": "2017-05-30T00:00:00"
          },
          {
            "time": 1496188800,
            "value": 1284992,
            "datetime": "2017-05-31T00:00:00",
            "time_iso": "2017-05-31T00:00:00"
          },
          {
            "time": 1496275200,
            "value": 1286016,
            "datetime": "2017-06-01T00:00:00",
            "time_iso": "2017-06-01T00:00:00"
          },
          {
            "time": 1496361600,
            "value": 1287193,
            "datetime": "2017-06-02T00:00:00",
            "time_iso": "2017-06-02T00:00:00"
          },
          {
            "time": 1496448000,
            "value": 1288435,
            "datetime": "2017-06-03T00:00:00",
            "time_iso": "2017-06-03T00:00:00"
          },
          {
            "time": 1496534400,
            "value": 1289375,
            "datetime": "2017-06-04T00:00:00",
            "time_iso": "2017-06-04T00:00:00"
          },
          {
            "time": 1496620800,
            "value": 1290474,
            "datetime": "2017-06-05T00:00:00",
            "time_iso": "2017-06-05T00:00:00"
          },
          {
            "time": 1496707200,
            "value": 1291360,
            "datetime": "2017-06-06T00:00:00",
            "time_iso": "2017-06-06T00:00:00"
          },
          {
            "time": 1496793600,
            "value": 1292115,
            "datetime": "2017-06-07T00:00:00",
            "time_iso": "2017-06-07T00:00:00"
          },
          {
            "time": 1496880000,
            "value": 1292876,
            "datetime": "2017-06-08T00:00:00",
            "time_iso": "2017-06-08T00:00:00"
          },
          {
            "time": 1496966400,
            "value": 1293693,
            "datetime": "2017-06-09T00:00:00",
            "time_iso": "2017-06-09T00:00:00"
          },
          {
            "time": 1497052800,
            "value": 1294551,
            "datetime": "2017-06-10T00:00:00",
            "time_iso": "2017-06-10T00:00:00"
          },
          {
            "time": 1497139200,
            "value": 1295554,
            "datetime": "2017-06-11T00:00:00",
            "time_iso": "2017-06-11T00:00:00"
          },
          {
            "time": 1497225600,
            "value": 1296246,
            "datetime": "2017-06-12T00:00:00",
            "time_iso": "2017-06-12T00:00:00"
          },
          {
            "time": 1497312000,
            "value": 1297271,
            "datetime": "2017-06-13T00:00:00",
            "time_iso": "2017-06-13T00:00:00"
          },
          {
            "time": 1497398400,
            "value": 1298362,
            "datetime": "2017-06-14T00:00:00",
            "time_iso": "2017-06-14T00:00:00"
          },
          {
            "time": 1497484800,
            "value": 1299087,
            "datetime": "2017-06-15T00:00:00",
            "time_iso": "2017-06-15T00:00:00"
          },
          {
            "time": 1497571200,
            "value": 1299835,
            "datetime": "2017-06-16T00:00:00",
            "time_iso": "2017-06-16T00:00:00"
          },
          {
            "time": 1497657600,
            "value": 1300792,
            "datetime": "2017-06-17T00:00:00",
            "time_iso": "2017-06-17T00:00:00"
          },
          {
            "time": 1497744000,
            "value": 1301557,
            "datetime": "2017-06-18T00:00:00",
            "time_iso": "2017-06-18T00:00:00"
          },
          {
            "time": 1497830400,
            "value": 1302402,
            "datetime": "2017-06-19T00:00:00",
            "time_iso": "2017-06-19T00:00:00"
          },
          {
            "time": 1497916800,
            "value": 1303034,
            "datetime": "2017-06-20T00:00:00",
            "time_iso": "2017-06-20T00:00:00"
          },
          {
            "time": 1498003200,
            "value": 1303818,
            "datetime": "2017-06-21T00:00:00",
            "time_iso": "2017-06-21T00:00:00"
          },
          {
            "time": 1498089600,
            "value": 1304705,
            "datetime": "2017-06-22T00:00:00",
            "time_iso": "2017-06-22T00:00:00"
          },
          {
            "time": 1498176000,
            "value": 1305583,
            "datetime": "2017-06-23T00:00:00",
            "time_iso": "2017-06-23T00:00:00"
          },
          {
            "time": 1498262400,
            "value": 1306504,
            "datetime": "2017-06-24T00:00:00",
            "time_iso": "2017-06-24T00:00:00"
          },
          {
            "time": 1498348800,
            "value": 1307514,
            "datetime": "2017-06-25T00:00:00",
            "time_iso": "2017-06-25T00:00:00"
          },
          {
            "time": 1498435200,
            "value": 1308156,
            "datetime": "2017-06-26T00:00:00",
            "time_iso": "2017-06-26T00:00:00"
          },
          {
            "time": 1498521600,
            "value": 1309134,
            "datetime": "2017-06-27T00:00:00",
            "time_iso": "2017-06-27T00:00:00"
          },
          {
            "time": 1498608000,
            "value": 1310229,
            "datetime": "2017-06-28T00:00:00",
            "time_iso": "2017-06-28T00:00:00"
          },
          {
            "time": 1498694400,
            "value": 1311093,
            "datetime": "2017-06-29T00:00:00",
            "time_iso": "2017-06-29T00:00:00"
          },
          {
            "time": 1498780800,
            "value": 1312005,
            "datetime": "2017-06-30T00:00:00",
            "time_iso": "2017-06-30T00:00:00"
          },
          {
            "time": 1498867200,
            "value": 1312947,
            "datetime": "2017-07-01T00:00:00",
            "time_iso": "2017-07-01T00:00:00"
          },
          {
            "time": 1498953600,
            "value": 1314151,
            "datetime": "2017-07-02T00:00:00",
            "time_iso": "2017-07-02T00:00:00"
          },
          {
            "time": 1499040000,
            "value": 1315004,
            "datetime": "2017-07-03T00:00:00",
            "time_iso": "2017-07-03T00:00:00"
          },
          {
            "time": 1499126400,
            "value": 1316085,
            "datetime": "2017-07-04T00:00:00",
            "time_iso": "2017-07-04T00:00:00"
          },
          {
            "time": 1499212800,
            "value": 1316975,
            "datetime": "2017-07-05T00:00:00",
            "time_iso": "2017-07-05T00:00:00"
          },
          {
            "time": 1499299200,
            "value": 1317796,
            "datetime": "2017-07-06T00:00:00",
            "time_iso": "2017-07-06T00:00:00"
          },
          {
            "time": 1499385600,
            "value": 1318478,
            "datetime": "2017-07-07T00:00:00",
            "time_iso": "2017-07-07T00:00:00"
          },
          {
            "time": 1499472000,
            "value": 1319358,
            "datetime": "2017-07-08T00:00:00",
            "time_iso": "2017-07-08T00:00:00"
          },
          {
            "time": 1499558400,
            "value": 1320394,
            "datetime": "2017-07-09T00:00:00",
            "time_iso": "2017-07-09T00:00:00"
          },
          {
            "time": 1499644800,
            "value": 1321342,
            "datetime": "2017-07-10T00:00:00",
            "time_iso": "2017-07-10T00:00:00"
          },
          {
            "time": 1499731200,
            "value": 1322067,
            "datetime": "2017-07-11T00:00:00",
            "time_iso": "2017-07-11T00:00:00"
          },
          {
            "time": 1499817600,
            "value": 1322846,
            "datetime": "2017-07-12T00:00:00",
            "time_iso": "2017-07-12T00:00:00"
          },
          {
            "time": 1499904000,
            "value": 1323851,
            "datetime": "2017-07-13T00:00:00",
            "time_iso": "2017-07-13T00:00:00"
          },
          {
            "time": 1499990400,
            "value": 1324533,
            "datetime": "2017-07-14T00:00:00",
            "time_iso": "2017-07-14T00:00:00"
          },
          {
            "time": 1500076800,
            "value": 1325370,
            "datetime": "2017-07-15T00:00:00",
            "time_iso": "2017-07-15T00:00:00"
          },
          {
            "time": 1500163200,
            "value": 1326231,
            "datetime": "2017-07-16T00:00:00",
            "time_iso": "2017-07-16T00:00:00"
          },
          {
            "time": 1500249600,
            "value": 1327040,
            "datetime": "2017-07-17T00:00:00",
            "time_iso": "2017-07-17T00:00:00"
          },
          {
            "time": 1500336000,
            "value": 1327854,
            "datetime": "2017-07-18T00:00:00",
            "time_iso": "2017-07-18T00:00:00"
          },
          {
            "time": 1500422400,
            "value": 1328916,
            "datetime": "2017-07-19T00:00:00",
            "time_iso": "2017-07-19T00:00:00"
          },
          {
            "time": 1500508800,
            "value": 1330304,
            "datetime": "2017-07-20T00:00:00",
            "time_iso": "2017-07-20T00:00:00"
          },
          {
            "time": 1500595200,
            "value": 1331412,
            "datetime": "2017-07-21T00:00:00",
            "time_iso": "2017-07-21T00:00:00"
          },
          {
            "time": 1500681600,
            "value": 1332945,
            "datetime": "2017-07-22T00:00:00",
            "time_iso": "2017-07-22T00:00:00"
          },
          {
            "time": 1500768000,
            "value": 1334483,
            "datetime": "2017-07-23T00:00:00",
            "time_iso": "2017-07-23T00:00:00"
          },
          {
            "time": 1500854400,
            "value": 1335521,
            "datetime": "2017-07-24T00:00:00",
            "time_iso": "2017-07-24T00:00:00"
          },
          {
            "time": 1500940800,
            "value": 1336350,
            "datetime": "2017-07-25T00:00:00",
            "time_iso": "2017-07-25T00:00:00"
          },
          {
            "time": 1501027200,
            "value": 1337177,
            "datetime": "2017-07-26T00:00:00",
            "time_iso": "2017-07-26T00:00:00"
          },
          {
            "time": 1501113600,
            "value": 1338250,
            "datetime": "2017-07-27T00:00:00",
            "time_iso": "2017-07-27T00:00:00"
          },
          {
            "time": 1501200000,
            "value": 1339648,
            "datetime": "2017-07-28T00:00:00",
            "time_iso": "2017-07-28T00:00:00"
          },
          {
            "time": 1501286400,
            "value": 1340504,
            "datetime": "2017-07-29T00:00:00",
            "time_iso": "2017-07-29T00:00:00"
          },
          {
            "time": 1501372800,
            "value": 1341440,
            "datetime": "2017-07-30T00:00:00",
            "time_iso": "2017-07-30T00:00:00"
          },
          {
            "time": 1501459200,
            "value": 1341142,
            "datetime": "2017-07-31T00:00:00",
            "time_iso": "2017-07-31T00:00:00"
          },
          {
            "time": 1501545600,
            "value": 1341949,
            "datetime": "2017-08-01T00:00:00",
            "time_iso": "2017-08-01T00:00:00"
          },
          {
            "time": 1501632000,
            "value": 1342607,
            "datetime": "2017-08-02T00:00:00",
            "time_iso": "2017-08-02T00:00:00"
          },
          {
            "time": 1501718400,
            "value": 1343434,
            "datetime": "2017-08-03T00:00:00",
            "time_iso": "2017-08-03T00:00:00"
          },
          {
            "time": 1501804800,
            "value": 1344371,
            "datetime": "2017-08-04T00:00:00",
            "time_iso": "2017-08-04T00:00:00"
          },
          {
            "time": 1501891200,
            "value": 1345186,
            "datetime": "2017-08-05T00:00:00",
            "time_iso": "2017-08-05T00:00:00"
          },
          {
            "time": 1501977600,
            "value": 1346058,
            "datetime": "2017-08-06T00:00:00",
            "time_iso": "2017-08-06T00:00:00"
          },
          {
            "time": 1502064000,
            "value": 1347341,
            "datetime": "2017-08-07T00:00:00",
            "time_iso": "2017-08-07T00:00:00"
          },
          {
            "time": 1502150400,
            "value": 1348488,
            "datetime": "2017-08-08T00:00:00",
            "time_iso": "2017-08-08T00:00:00"
          },
          {
            "time": 1502236800,
            "value": 1349707,
            "datetime": "2017-08-09T00:00:00",
            "time_iso": "2017-08-09T00:00:00"
          },
          {
            "time": 1502323200,
            "value": 1350932,
            "datetime": "2017-08-10T00:00:00",
            "time_iso": "2017-08-10T00:00:00"
          },
          {
            "time": 1502409600,
            "value": 1352265,
            "datetime": "2017-08-11T00:00:00",
            "time_iso": "2017-08-11T00:00:00"
          },
          {
            "time": 1502496000,
            "value": 1354177,
            "datetime": "2017-08-12T00:00:00",
            "time_iso": "2017-08-12T00:00:00"
          },
          {
            "time": 1502582400,
            "value": 1355464,
            "datetime": "2017-08-13T00:00:00",
            "time_iso": "2017-08-13T00:00:00"
          },
          {
            "time": 1502668800,
            "value": 1356976,
            "datetime": "2017-08-14T00:00:00",
            "time_iso": "2017-08-14T00:00:00"
          },
          {
            "time": 1502755200,
            "value": 1358495,
            "datetime": "2017-08-15T00:00:00",
            "time_iso": "2017-08-15T00:00:00"
          },
          {
            "time": 1502841600,
            "value": 1360089,
            "datetime": "2017-08-16T00:00:00",
            "time_iso": "2017-08-16T00:00:00"
          },
          {
            "time": 1502928000,
            "value": 1361870,
            "datetime": "2017-08-17T00:00:00",
            "time_iso": "2017-08-17T00:00:00"
          },
          {
            "time": 1503014400,
            "value": 1364471,
            "datetime": "2017-08-18T00:00:00",
            "time_iso": "2017-08-18T00:00:00"
          },
          {
            "time": 1503100800,
            "value": 1367280,
            "datetime": "2017-08-19T00:00:00",
            "time_iso": "2017-08-19T00:00:00"
          },
          {
            "time": 1503187200,
            "value": 1372822,
            "datetime": "2017-08-20T00:00:00",
            "time_iso": "2017-08-20T00:00:00"
          },
          {
            "time": 1503273600,
            "value": 1447623,
            "datetime": "2017-08-21T00:00:00",
            "time_iso": "2017-08-21T00:00:00"
          },
          {
            "time": 1503360000,
            "value": 1450235,
            "datetime": "2017-08-22T00:00:00",
            "time_iso": "2017-08-22T00:00:00"
          },
          {
            "time": 1503446400,
            "value": 1451028,
            "datetime": "2017-08-23T00:00:00",
            "time_iso": "2017-08-23T00:00:00"
          },
          {
            "time": 1503532800,
            "value": 1452203,
            "datetime": "2017-08-24T00:00:00",
            "time_iso": "2017-08-24T00:00:00"
          },
          {
            "time": 1503619200,
            "value": 1453486,
            "datetime": "2017-08-25T00:00:00",
            "time_iso": "2017-08-25T00:00:00"
          },
          {
            "time": 1503705600,
            "value": 1455446,
            "datetime": "2017-08-26T00:00:00",
            "time_iso": "2017-08-26T00:00:00"
          },
          {
            "time": 1503792000,
            "value": 1456929,
            "datetime": "2017-08-27T00:00:00",
            "time_iso": "2017-08-27T00:00:00"
          },
          {
            "time": 1503878400,
            "value": 1458224,
            "datetime": "2017-08-28T00:00:00",
            "time_iso": "2017-08-28T00:00:00"
          },
          {
            "time": 1503964800,
            "value": 1459316,
            "datetime": "2017-08-29T00:00:00",
            "time_iso": "2017-08-29T00:00:00"
          },
          {
            "time": 1504051200,
            "value": 1460270,
            "datetime": "2017-08-30T00:00:00",
            "time_iso": "2017-08-30T00:00:00"
          },
          {
            "time": 1504137600,
            "value": 1461234,
            "datetime": "2017-08-31T00:00:00",
            "time_iso": "2017-08-31T00:00:00"
          },
          {
            "time": 1504224000,
            "value": 1462357,
            "datetime": "2017-09-01T00:00:00",
            "time_iso": "2017-09-01T00:00:00"
          },
          {
            "time": 1504310400,
            "value": 1463542,
            "datetime": "2017-09-02T00:00:00",
            "time_iso": "2017-09-02T00:00:00"
          },
          {
            "time": 1504396800,
            "value": 1464638,
            "datetime": "2017-09-03T00:00:00",
            "time_iso": "2017-09-03T00:00:00"
          },
          {
            "time": 1504483200,
            "value": 1465758,
            "datetime": "2017-09-04T00:00:00",
            "time_iso": "2017-09-04T00:00:00"
          },
          {
            "time": 1504569600,
            "value": 1466954,
            "datetime": "2017-09-05T00:00:00",
            "time_iso": "2017-09-05T00:00:00"
          },
          {
            "time": 1504656000,
            "value": 1468003,
            "datetime": "2017-09-06T00:00:00",
            "time_iso": "2017-09-06T00:00:00"
          },
          {
            "time": 1504742400,
            "value": 1469316,
            "datetime": "2017-09-07T00:00:00",
            "time_iso": "2017-09-07T00:00:00"
          },
          {
            "time": 1504828800,
            "value": 1470694,
            "datetime": "2017-09-08T00:00:00",
            "time_iso": "2017-09-08T00:00:00"
          },
          {
            "time": 1504915200,
            "value": 1472157,
            "datetime": "2017-09-09T00:00:00",
            "time_iso": "2017-09-09T00:00:00"
          },
          {
            "time": 1505001600,
            "value": 1474039,
            "datetime": "2017-09-10T00:00:00",
            "time_iso": "2017-09-10T00:00:00"
          },
          {
            "time": 1505088000,
            "value": 1475748,
            "datetime": "2017-09-11T00:00:00",
            "time_iso": "2017-09-11T00:00:00"
          },
          {
            "time": 1505174400,
            "value": 1477326,
            "datetime": "2017-09-12T00:00:00",
            "time_iso": "2017-09-12T00:00:00"
          },
          {
            "time": 1505260800,
            "value": 1478484,
            "datetime": "2017-09-13T00:00:00",
            "time_iso": "2017-09-13T00:00:00"
          },
          {
            "time": 1505347200,
            "value": 1480865,
            "datetime": "2017-09-14T00:00:00",
            "time_iso": "2017-09-14T00:00:00"
          },
          {
            "time": 1505433600,
            "value": 1487081,
            "datetime": "2017-09-15T00:00:00",
            "time_iso": "2017-09-15T00:00:00"
          },
          {
            "time": 1505520000,
            "value": 1489417,
            "datetime": "2017-09-16T00:00:00",
            "time_iso": "2017-09-16T00:00:00"
          },
          {
            "time": 1505606400,
            "value": 1491525,
            "datetime": "2017-09-17T00:00:00",
            "time_iso": "2017-09-17T00:00:00"
          },
          {
            "time": 1505692800,
            "value": 1493217,
            "datetime": "2017-09-18T00:00:00",
            "time_iso": "2017-09-18T00:00:00"
          },
          {
            "time": 1505779200,
            "value": 1495520,
            "datetime": "2017-09-19T00:00:00",
            "time_iso": "2017-09-19T00:00:00"
          },
          {
            "time": 1505865600,
            "value": 1497441,
            "datetime": "2017-09-20T00:00:00",
            "time_iso": "2017-09-20T00:00:00"
          },
          {
            "time": 1505952000,
            "value": 1499192,
            "datetime": "2017-09-21T00:00:00",
            "time_iso": "2017-09-21T00:00:00"
          },
          {
            "time": 1506038400,
            "value": 1501360,
            "datetime": "2017-09-22T00:00:00",
            "time_iso": "2017-09-22T00:00:00"
          },
          {
            "time": 1506124800,
            "value": 1504282,
            "datetime": "2017-09-23T00:00:00",
            "time_iso": "2017-09-23T00:00:00"
          },
          {
            "time": 1506211200,
            "value": 1505973,
            "datetime": "2017-09-24T00:00:00",
            "time_iso": "2017-09-24T00:00:00"
          },
          {
            "time": 1506297600,
            "value": 1506998,
            "datetime": "2017-09-25T00:00:00",
            "time_iso": "2017-09-25T00:00:00"
          },
          {
            "time": 1506384000,
            "value": 1507786,
            "datetime": "2017-09-26T00:00:00",
            "time_iso": "2017-09-26T00:00:00"
          },
          {
            "time": 1506470400,
            "value": 1508687,
            "datetime": "2017-09-27T00:00:00",
            "time_iso": "2017-09-27T00:00:00"
          },
          {
            "time": 1506556800,
            "value": 1509772,
            "datetime": "2017-09-28T00:00:00",
            "time_iso": "2017-09-28T00:00:00"
          },
          {
            "time": 1506643200,
            "value": 1511312,
            "datetime": "2017-09-29T00:00:00",
            "time_iso": "2017-09-29T00:00:00"
          },
          {
            "time": 1506729600,
            "value": 1512502,
            "datetime": "2017-09-30T00:00:00",
            "time_iso": "2017-09-30T00:00:00"
          },
          {
            "time": 1506816000,
            "value": 1513639,
            "datetime": "2017-10-01T00:00:00",
            "time_iso": "2017-10-01T00:00:00"
          },
          {
            "time": 1506902400,
            "value": 1514617,
            "datetime": "2017-10-02T00:00:00",
            "time_iso": "2017-10-02T00:00:00"
          },
          {
            "time": 1506988800,
            "value": 1515337,
            "datetime": "2017-10-03T00:00:00",
            "time_iso": "2017-10-03T00:00:00"
          },
          {
            "time": 1507075200,
            "value": 1516170,
            "datetime": "2017-10-04T00:00:00",
            "time_iso": "2017-10-04T00:00:00"
          },
          {
            "time": 1507161600,
            "value": 1517114,
            "datetime": "2017-10-05T00:00:00",
            "time_iso": "2017-10-05T00:00:00"
          },
          {
            "time": 1507248000,
            "value": 1517813,
            "datetime": "2017-10-06T00:00:00",
            "time_iso": "2017-10-06T00:00:00"
          },
          {
            "time": 1507334400,
            "value": 1518600,
            "datetime": "2017-10-07T00:00:00",
            "time_iso": "2017-10-07T00:00:00"
          },
          {
            "time": 1507420800,
            "value": 1519628,
            "datetime": "2017-10-08T00:00:00",
            "time_iso": "2017-10-08T00:00:00"
          },
          {
            "time": 1507507200,
            "value": 1520395,
            "datetime": "2017-10-09T00:00:00",
            "time_iso": "2017-10-09T00:00:00"
          },
          {
            "time": 1507593600,
            "value": 1521197,
            "datetime": "2017-10-10T00:00:00",
            "time_iso": "2017-10-10T00:00:00"
          },
          {
            "time": 1507680000,
            "value": 1521988,
            "datetime": "2017-10-11T00:00:00",
            "time_iso": "2017-10-11T00:00:00"
          },
          {
            "time": 1507766400,
            "value": 1522981,
            "datetime": "2017-10-12T00:00:00",
            "time_iso": "2017-10-12T00:00:00"
          },
          {
            "time": 1507852800,
            "value": 1523763,
            "datetime": "2017-10-13T00:00:00",
            "time_iso": "2017-10-13T00:00:00"
          },
          {
            "time": 1507939200,
            "value": 1524953,
            "datetime": "2017-10-14T00:00:00",
            "time_iso": "2017-10-14T00:00:00"
          },
          {
            "time": 1508025600,
            "value": 1526234,
            "datetime": "2017-10-15T00:00:00",
            "time_iso": "2017-10-15T00:00:00"
          },
          {
            "time": 1508112000,
            "value": 1527496,
            "datetime": "2017-10-16T00:00:00",
            "time_iso": "2017-10-16T00:00:00"
          },
          {
            "time": 1508198400,
            "value": 1528696,
            "datetime": "2017-10-17T00:00:00",
            "time_iso": "2017-10-17T00:00:00"
          },
          {
            "time": 1508284800,
            "value": 1529588,
            "datetime": "2017-10-18T00:00:00",
            "time_iso": "2017-10-18T00:00:00"
          },
          {
            "time": 1508371200,
            "value": 1530426,
            "datetime": "2017-10-19T00:00:00",
            "time_iso": "2017-10-19T00:00:00"
          },
          {
            "time": 1508457600,
            "value": 1531813,
            "datetime": "2017-10-20T00:00:00",
            "time_iso": "2017-10-20T00:00:00"
          },
          {
            "time": 1508544000,
            "value": 1533043,
            "datetime": "2017-10-21T00:00:00",
            "time_iso": "2017-10-21T00:00:00"
          },
          {
            "time": 1508630400,
            "value": 1534295,
            "datetime": "2017-10-22T00:00:00",
            "time_iso": "2017-10-22T00:00:00"
          },
          {
            "time": 1508716800,
            "value": 1535136,
            "datetime": "2017-10-23T00:00:00",
            "time_iso": "2017-10-23T00:00:00"
          },
          {
            "time": 1508803200,
            "value": 1535906,
            "datetime": "2017-10-24T00:00:00",
            "time_iso": "2017-10-24T00:00:00"
          },
          {
            "time": 1508889600,
            "value": 1536849,
            "datetime": "2017-10-25T00:00:00",
            "time_iso": "2017-10-25T00:00:00"
          },
          {
            "time": 1508976000,
            "value": 1537700,
            "datetime": "2017-10-26T00:00:00",
            "time_iso": "2017-10-26T00:00:00"
          },
          {
            "time": 1509062400,
            "value": 1538371,
            "datetime": "2017-10-27T00:00:00",
            "time_iso": "2017-10-27T00:00:00"
          },
          {
            "time": 1509148800,
            "value": 1539116,
            "datetime": "2017-10-28T00:00:00",
            "time_iso": "2017-10-28T00:00:00"
          },
          {
            "time": 1509235200,
            "value": 1539985,
            "datetime": "2017-10-29T00:00:00",
            "time_iso": "2017-10-29T00:00:00"
          },
          {
            "time": 1509321600,
            "value": 1540805,
            "datetime": "2017-10-30T00:00:00",
            "time_iso": "2017-10-30T00:00:00"
          },
          {
            "time": 1509408000,
            "value": 1541628,
            "datetime": "2017-10-31T00:00:00",
            "time_iso": "2017-10-31T00:00:00"
          },
          {
            "time": 1509494400,
            "value": 1542410,
            "datetime": "2017-11-01T00:00:00",
            "time_iso": "2017-11-01T00:00:00"
          },
          {
            "time": 1509580800,
            "value": 1543282,
            "datetime": "2017-11-02T00:00:00",
            "time_iso": "2017-11-02T00:00:00"
          },
          {
            "time": 1509667200,
            "value": 1543982,
            "datetime": "2017-11-03T00:00:00",
            "time_iso": "2017-11-03T00:00:00"
          },
          {
            "time": 1509753600,
            "value": 1544763,
            "datetime": "2017-11-04T00:00:00",
            "time_iso": "2017-11-04T00:00:00"
          },
          {
            "time": 1509840000,
            "value": 1545776,
            "datetime": "2017-11-05T00:00:00",
            "time_iso": "2017-11-05T00:00:00"
          },
          {
            "time": 1509926400,
            "value": 1546680,
            "datetime": "2017-11-06T00:00:00",
            "time_iso": "2017-11-06T00:00:00"
          },
          {
            "time": 1510012800,
            "value": 1547387,
            "datetime": "2017-11-07T00:00:00",
            "time_iso": "2017-11-07T00:00:00"
          },
          {
            "time": 1510099200,
            "value": 1548154,
            "datetime": "2017-11-08T00:00:00",
            "time_iso": "2017-11-08T00:00:00"
          },
          {
            "time": 1510185600,
            "value": 1548824,
            "datetime": "2017-11-09T00:00:00",
            "time_iso": "2017-11-09T00:00:00"
          },
          {
            "time": 1510272000,
            "value": 1549597,
            "datetime": "2017-11-10T00:00:00",
            "time_iso": "2017-11-10T00:00:00"
          },
          {
            "time": 1510358400,
            "value": 1550752,
            "datetime": "2017-11-11T00:00:00",
            "time_iso": "2017-11-11T00:00:00"
          },
          {
            "time": 1510444800,
            "value": 1551973,
            "datetime": "2017-11-12T00:00:00",
            "time_iso": "2017-11-12T00:00:00"
          },
          {
            "time": 1510531200,
            "value": 1552932,
            "datetime": "2017-11-13T00:00:00",
            "time_iso": "2017-11-13T00:00:00"
          },
          {
            "time": 1510617600,
            "value": 1554088,
            "datetime": "2017-11-14T00:00:00",
            "time_iso": "2017-11-14T00:00:00"
          },
          {
            "time": 1510704000,
            "value": 1555222,
            "datetime": "2017-11-15T00:00:00",
            "time_iso": "2017-11-15T00:00:00"
          },
          {
            "time": 1510790400,
            "value": 1556097,
            "datetime": "2017-11-16T00:00:00",
            "time_iso": "2017-11-16T00:00:00"
          },
          {
            "time": 1510876800,
            "value": 1557256,
            "datetime": "2017-11-17T00:00:00",
            "time_iso": "2017-11-17T00:00:00"
          },
          {
            "time": 1510963200,
            "value": 1558593,
            "datetime": "2017-11-18T00:00:00",
            "time_iso": "2017-11-18T00:00:00"
          },
          {
            "time": 1511049600,
            "value": 1559957,
            "datetime": "2017-11-19T00:00:00",
            "time_iso": "2017-11-19T00:00:00"
          },
          {
            "time": 1511136000,
            "value": 1560979,
            "datetime": "2017-11-20T00:00:00",
            "time_iso": "2017-11-20T00:00:00"
          },
          {
            "time": 1511222400,
            "value": 1562088,
            "datetime": "2017-11-21T00:00:00",
            "time_iso": "2017-11-21T00:00:00"
          },
          {
            "time": 1511308800,
            "value": 1563193,
            "datetime": "2017-11-22T00:00:00",
            "time_iso": "2017-11-22T00:00:00"
          },
          {
            "time": 1511395200,
            "value": 1564147,
            "datetime": "2017-11-23T00:00:00",
            "time_iso": "2017-11-23T00:00:00"
          },
          {
            "time": 1511481600,
            "value": 1565078,
            "datetime": "2017-11-24T00:00:00",
            "time_iso": "2017-11-24T00:00:00"
          },
          {
            "time": 1511568000,
            "value": 1566049,
            "datetime": "2017-11-25T00:00:00",
            "time_iso": "2017-11-25T00:00:00"
          },
          {
            "time": 1511654400,
            "value": 1567227,
            "datetime": "2017-11-26T00:00:00",
            "time_iso": "2017-11-26T00:00:00"
          },
          {
            "time": 1511740800,
            "value": 1568274,
            "datetime": "2017-11-27T00:00:00",
            "time_iso": "2017-11-27T00:00:00"
          },
          {
            "time": 1511827200,
            "value": 1569577,
            "datetime": "2017-11-28T00:00:00",
            "time_iso": "2017-11-28T00:00:00"
          },
          {
            "time": 1511913600,
            "value": 1570803,
            "datetime": "2017-11-29T00:00:00",
            "time_iso": "2017-11-29T00:00:00"
          },
          {
            "time": 1512000000,
            "value": 1572023,
            "datetime": "2017-11-30T00:00:00",
            "time_iso": "2017-11-30T00:00:00"
          },
          {
            "time": 1512086400,
            "value": 1573044,
            "datetime": "2017-12-01T00:00:00",
            "time_iso": "2017-12-01T00:00:00"
          },
          {
            "time": 1512172800,
            "value": 1574409,
            "datetime": "2017-12-02T00:00:00",
            "time_iso": "2017-12-02T00:00:00"
          },
          {
            "time": 1512259200,
            "value": 1575947,
            "datetime": "2017-12-03T00:00:00",
            "time_iso": "2017-12-03T00:00:00"
          },
          {
            "time": 1512345600,
            "value": 1577613,
            "datetime": "2017-12-04T00:00:00",
            "time_iso": "2017-12-04T00:00:00"
          },
          {
            "time": 1512432000,
            "value": 1579270,
            "datetime": "2017-12-05T00:00:00",
            "time_iso": "2017-12-05T00:00:00"
          },
          {
            "time": 1512518400,
            "value": 1580647,
            "datetime": "2017-12-06T00:00:00",
            "time_iso": "2017-12-06T00:00:00"
          },
          {
            "time": 1512604800,
            "value": 1581848,
            "datetime": "2017-12-07T00:00:00",
            "time_iso": "2017-12-07T00:00:00"
          },
          {
            "time": 1512691200,
            "value": 1583211,
            "datetime": "2017-12-08T00:00:00",
            "time_iso": "2017-12-08T00:00:00"
          },
          {
            "time": 1512777600,
            "value": 1584606,
            "datetime": "2017-12-09T00:00:00",
            "time_iso": "2017-12-09T00:00:00"
          },
          {
            "time": 1512864000,
            "value": 1586253,
            "datetime": "2017-12-10T00:00:00",
            "time_iso": "2017-12-10T00:00:00"
          },
          {
            "time": 1512950400,
            "value": 1587450,
            "datetime": "2017-12-11T00:00:00",
            "time_iso": "2017-12-11T00:00:00"
          },
          {
            "time": 1513036800,
            "value": 1588854,
            "datetime": "2017-12-12T00:00:00",
            "time_iso": "2017-12-12T00:00:00"
          },
          {
            "time": 1513123200,
            "value": 1590582,
            "datetime": "2017-12-13T00:00:00",
            "time_iso": "2017-12-13T00:00:00"
          },
          {
            "time": 1513209600,
            "value": 1594908,
            "datetime": "2017-12-14T00:00:00",
            "time_iso": "2017-12-14T00:00:00"
          },
          {
            "time": 1513296000,
            "value": 1597549,
            "datetime": "2017-12-15T00:00:00",
            "time_iso": "2017-12-15T00:00:00"
          },
          {
            "time": 1513382400,
            "value": 1599556,
            "datetime": "2017-12-16T00:00:00",
            "time_iso": "2017-12-16T00:00:00"
          },
          {
            "time": 1513468800,
            "value": 1601824,
            "datetime": "2017-12-17T00:00:00",
            "time_iso": "2017-12-17T00:00:00"
          },
          {
            "time": 1513555200,
            "value": 1603941,
            "datetime": "2017-12-18T00:00:00",
            "time_iso": "2017-12-18T00:00:00"
          },
          {
            "time": 1513641600,
            "value": 1608699,
            "datetime": "2017-12-19T00:00:00",
            "time_iso": "2017-12-19T00:00:00"
          },
          {
            "time": 1513728000,
            "value": 1612365,
            "datetime": "2017-12-20T00:00:00",
            "time_iso": "2017-12-20T00:00:00"
          },
          {
            "time": 1513814400,
            "value": 1616133,
            "datetime": "2017-12-21T00:00:00",
            "time_iso": "2017-12-21T00:00:00"
          },
          {
            "time": 1513900800,
            "value": 1618213,
            "datetime": "2017-12-22T00:00:00",
            "time_iso": "2017-12-22T00:00:00"
          },
          {
            "time": 1513987200,
            "value": 1620773,
            "datetime": "2017-12-23T00:00:00",
            "time_iso": "2017-12-23T00:00:00"
          },
          {
            "time": 1514073600,
            "value": 1622816,
            "datetime": "2017-12-24T00:00:00",
            "time_iso": "2017-12-24T00:00:00"
          },
          {
            "time": 1514160000,
            "value": 1624799,
            "datetime": "2017-12-25T00:00:00",
            "time_iso": "2017-12-25T00:00:00"
          },
          {
            "time": 1514246400,
            "value": 1626900,
            "datetime": "2017-12-26T00:00:00",
            "time_iso": "2017-12-26T00:00:00"
          },
          {
            "time": 1514332800,
            "value": 1629301,
            "datetime": "2017-12-27T00:00:00",
            "time_iso": "2017-12-27T00:00:00"
          },
          {
            "time": 1514419200,
            "value": 1631948,
            "datetime": "2017-12-28T00:00:00",
            "time_iso": "2017-12-28T00:00:00"
          },
          {
            "time": 1514505600,
            "value": 1634343,
            "datetime": "2017-12-29T00:00:00",
            "time_iso": "2017-12-29T00:00:00"
          },
          {
            "time": 1514592000,
            "value": 1636998,
            "datetime": "2017-12-30T00:00:00",
            "time_iso": "2017-12-30T00:00:00"
          },
          {
            "time": 1514678400,
            "value": 1639664,
            "datetime": "2017-12-31T00:00:00",
            "time_iso": "2017-12-31T00:00:00"
          },
          {
            "time": 1514764800,
            "value": 1642293,
            "datetime": "2018-01-01T00:00:00",
            "time_iso": "2018-01-01T00:00:00"
          },
          {
            "time": 1514851200,
            "value": 1644695,
            "datetime": "2018-01-02T00:00:00",
            "time_iso": "2018-01-02T00:00:00"
          },
          {
            "time": 1514937600,
            "value": 1646700,
            "datetime": "2018-01-03T00:00:00",
            "time_iso": "2018-01-03T00:00:00"
          },
          {
            "time": 1515024000,
            "value": 1648388,
            "datetime": "2018-01-04T00:00:00",
            "time_iso": "2018-01-04T00:00:00"
          },
          {
            "time": 1515110400,
            "value": 1650213,
            "datetime": "2018-01-05T00:00:00",
            "time_iso": "2018-01-05T00:00:00"
          },
          {
            "time": 1515196800,
            "value": 1651878,
            "datetime": "2018-01-06T00:00:00",
            "time_iso": "2018-01-06T00:00:00"
          },
          {
            "time": 1515283200,
            "value": 1653927,
            "datetime": "2018-01-07T00:00:00",
            "time_iso": "2018-01-07T00:00:00"
          },
          {
            "time": 1515369600,
            "value": 1655890,
            "datetime": "2018-01-08T00:00:00",
            "time_iso": "2018-01-08T00:00:00"
          },
          {
            "time": 1515456000,
            "value": 1657562,
            "datetime": "2018-01-09T00:00:00",
            "time_iso": "2018-01-09T00:00:00"
          },
          {
            "time": 1515542400,
            "value": 1659364,
            "datetime": "2018-01-10T00:00:00",
            "time_iso": "2018-01-10T00:00:00"
          },
          {
            "time": 1515628800,
            "value": 1660304,
            "datetime": "2018-01-11T00:00:00",
            "time_iso": "2018-01-11T00:00:00"
          },
          {
            "time": 1515715200,
            "value": 1661763,
            "datetime": "2018-01-12T00:00:00",
            "time_iso": "2018-01-12T00:00:00"
          },
          {
            "time": 1515801600,
            "value": 1663805,
            "datetime": "2018-01-13T00:00:00",
            "time_iso": "2018-01-13T00:00:00"
          },
          {
            "time": 1515888000,
            "value": 1667906,
            "datetime": "2018-01-14T00:00:00",
            "time_iso": "2018-01-14T00:00:00"
          },
          {
            "time": 1515974400,
            "value": 1671977,
            "datetime": "2018-01-15T00:00:00",
            "time_iso": "2018-01-15T00:00:00"
          },
          {
            "time": 1516060800,
            "value": 1675966,
            "datetime": "2018-01-16T00:00:00",
            "time_iso": "2018-01-16T00:00:00"
          },
          {
            "time": 1516147200,
            "value": 1680217,
            "datetime": "2018-01-17T00:00:00",
            "time_iso": "2018-01-17T00:00:00"
          },
          {
            "time": 1516233600,
            "value": 1683446,
            "datetime": "2018-01-18T00:00:00",
            "time_iso": "2018-01-18T00:00:00"
          },
          {
            "time": 1516320000,
            "value": 1686007,
            "datetime": "2018-01-19T00:00:00",
            "time_iso": "2018-01-19T00:00:00"
          },
          {
            "time": 1516406400,
            "value": 1688941,
            "datetime": "2018-01-20T00:00:00",
            "time_iso": "2018-01-20T00:00:00"
          },
          {
            "time": 1516492800,
            "value": 1691708,
            "datetime": "2018-01-21T00:00:00",
            "time_iso": "2018-01-21T00:00:00"
          },
          {
            "time": 1516579200,
            "value": 1694871,
            "datetime": "2018-01-22T00:00:00",
            "time_iso": "2018-01-22T00:00:00"
          },
          {
            "time": 1516665600,
            "value": 1698126,
            "datetime": "2018-01-23T00:00:00",
            "time_iso": "2018-01-23T00:00:00"
          },
          {
            "time": 1516752000,
            "value": 1700676,
            "datetime": "2018-01-24T00:00:00",
            "time_iso": "2018-01-24T00:00:00"
          },
          {
            "time": 1516838400,
            "value": 1703178,
            "datetime": "2018-01-25T00:00:00",
            "time_iso": "2018-01-25T00:00:00"
          },
          {
            "time": 1516924800,
            "value": 1705404,
            "datetime": "2018-01-26T00:00:00",
            "time_iso": "2018-01-26T00:00:00"
          },
          {
            "time": 1517011200,
            "value": 1707829,
            "datetime": "2018-01-27T00:00:00",
            "time_iso": "2018-01-27T00:00:00"
          },
          {
            "time": 1517097600,
            "value": 1711205,
            "datetime": "2018-01-28T00:00:00",
            "time_iso": "2018-01-28T00:00:00"
          },
          {
            "time": 1517184000,
            "value": 1715573,
            "datetime": "2018-01-29T00:00:00",
            "time_iso": "2018-01-29T00:00:00"
          },
          {
            "time": 1517270400,
            "value": 1721426,
            "datetime": "2018-01-30T00:00:00",
            "time_iso": "2018-01-30T00:00:00"
          },
          {
            "time": 1517356800,
            "value": 1834535,
            "datetime": "2018-01-31T00:00:00",
            "time_iso": "2018-01-31T00:00:00"
          },
          {
            "time": 1517443200,
            "value": 1847054,
            "datetime": "2018-02-01T00:00:00",
            "time_iso": "2018-02-01T00:00:00"
          },
          {
            "time": 1517529600,
            "value": 1850985,
            "datetime": "2018-02-02T00:00:00",
            "time_iso": "2018-02-02T00:00:00"
          },
          {
            "time": 1517616000,
            "value": 1855113,
            "datetime": "2018-02-03T00:00:00",
            "time_iso": "2018-02-03T00:00:00"
          },
          {
            "time": 1517702400,
            "value": 1858692,
            "datetime": "2018-02-04T00:00:00",
            "time_iso": "2018-02-04T00:00:00"
          },
          {
            "time": 1517788800,
            "value": 1861231,
            "datetime": "2018-02-05T00:00:00",
            "time_iso": "2018-02-05T00:00:00"
          },
          {
            "time": 1517875200,
            "value": 1869341,
            "datetime": "2018-02-06T00:00:00",
            "time_iso": "2018-02-06T00:00:00"
          },
          {
            "time": 1517961600,
            "value": 1877913,
            "datetime": "2018-02-07T00:00:00",
            "time_iso": "2018-02-07T00:00:00"
          },
          {
            "time": 1518048000,
            "value": 1884302,
            "datetime": "2018-02-08T00:00:00",
            "time_iso": "2018-02-08T00:00:00"
          },
          {
            "time": 1518134400,
            "value": 1894637,
            "datetime": "2018-02-09T00:00:00",
            "time_iso": "2018-02-09T00:00:00"
          },
          {
            "time": 1518220800,
            "value": 1901997,
            "datetime": "2018-02-10T00:00:00",
            "time_iso": "2018-02-10T00:00:00"
          },
          {
            "time": 1518307200,
            "value": 1911049,
            "datetime": "2018-02-11T00:00:00",
            "time_iso": "2018-02-11T00:00:00"
          },
          {
            "time": 1518393600,
            "value": 1917464,
            "datetime": "2018-02-12T00:00:00",
            "time_iso": "2018-02-12T00:00:00"
          },
          {
            "time": 1518480000,
            "value": 1920670,
            "datetime": "2018-02-13T00:00:00",
            "time_iso": "2018-02-13T00:00:00"
          },
          {
            "time": 1518566400,
            "value": 1922899,
            "datetime": "2018-02-14T00:00:00",
            "time_iso": "2018-02-14T00:00:00"
          },
          {
            "time": 1518652800,
            "value": 1925039,
            "datetime": "2018-02-15T00:00:00",
            "time_iso": "2018-02-15T00:00:00"
          },
          {
            "time": 1518739200,
            "value": 1927305,
            "datetime": "2018-02-16T00:00:00",
            "time_iso": "2018-02-16T00:00:00"
          },
          {
            "time": 1518825600,
            "value": 1928857,
            "datetime": "2018-02-17T00:00:00",
            "time_iso": "2018-02-17T00:00:00"
          },
          {
            "time": 1518912000,
            "value": 1931585,
            "datetime": "2018-02-18T00:00:00",
            "time_iso": "2018-02-18T00:00:00"
          },
          {
            "time": 1518998400,
            "value": 1933467,
            "datetime": "2018-02-19T00:00:00",
            "time_iso": "2018-02-19T00:00:00"
          },
          {
            "time": 1519084800,
            "value": 1935202,
            "datetime": "2018-02-20T00:00:00",
            "time_iso": "2018-02-20T00:00:00"
          },
          {
            "time": 1519171200,
            "value": 1936759,
            "datetime": "2018-02-21T00:00:00",
            "time_iso": "2018-02-21T00:00:00"
          },
          {
            "time": 1519257600,
            "value": 1938826,
            "datetime": "2018-02-22T00:00:00",
            "time_iso": "2018-02-22T00:00:00"
          },
          {
            "time": 1519344000,
            "value": 1941099,
            "datetime": "2018-02-23T00:00:00",
            "time_iso": "2018-02-23T00:00:00"
          },
          {
            "time": 1519430400,
            "value": 1943956,
            "datetime": "2018-02-24T00:00:00",
            "time_iso": "2018-02-24T00:00:00"
          },
          {
            "time": 1519516800,
            "value": 1947550,
            "datetime": "2018-02-25T00:00:00",
            "time_iso": "2018-02-25T00:00:00"
          },
          {
            "time": 1519603200,
            "value": 1951372,
            "datetime": "2018-02-26T00:00:00",
            "time_iso": "2018-02-26T00:00:00"
          },
          {
            "time": 1519689600,
            "value": 1954485,
            "datetime": "2018-02-27T00:00:00",
            "time_iso": "2018-02-27T00:00:00"
          },
          {
            "time": 1519776000,
            "value": 1957221,
            "datetime": "2018-02-28T00:00:00",
            "time_iso": "2018-02-28T00:00:00"
          },
          {
            "time": 1519862400,
            "value": 1959640,
            "datetime": "2018-03-01T00:00:00",
            "time_iso": "2018-03-01T00:00:00"
          },
          {
            "time": 1519948800,
            "value": 1961867,
            "datetime": "2018-03-02T00:00:00",
            "time_iso": "2018-03-02T00:00:00"
          },
          {
            "time": 1520035200,
            "value": 1963820,
            "datetime": "2018-03-03T00:00:00",
            "time_iso": "2018-03-03T00:00:00"
          },
          {
            "time": 1520121600,
            "value": 1965643,
            "datetime": "2018-03-04T00:00:00",
            "time_iso": "2018-03-04T00:00:00"
          },
          {
            "time": 1520208000,
            "value": 1967081,
            "datetime": "2018-03-05T00:00:00",
            "time_iso": "2018-03-05T00:00:00"
          },
          {
            "time": 1520294400,
            "value": 1968415,
            "datetime": "2018-03-06T00:00:00",
            "time_iso": "2018-03-06T00:00:00"
          },
          {
            "time": 1520380800,
            "value": 1969754,
            "datetime": "2018-03-07T00:00:00",
            "time_iso": "2018-03-07T00:00:00"
          },
          {
            "time": 1520467200,
            "value": 1971130,
            "datetime": "2018-03-08T00:00:00",
            "time_iso": "2018-03-08T00:00:00"
          },
          {
            "time": 1520553600,
            "value": 1972807,
            "datetime": "2018-03-09T00:00:00",
            "time_iso": "2018-03-09T00:00:00"
          },
          {
            "time": 1520640000,
            "value": 1974640,
            "datetime": "2018-03-10T00:00:00",
            "time_iso": "2018-03-10T00:00:00"
          },
          {
            "time": 1520726400,
            "value": 1976658,
            "datetime": "2018-03-11T00:00:00",
            "time_iso": "2018-03-11T00:00:00"
          },
          {
            "time": 1520812800,
            "value": 1978232,
            "datetime": "2018-03-12T00:00:00",
            "time_iso": "2018-03-12T00:00:00"
          },
          {
            "time": 1520899200,
            "value": 1979812,
            "datetime": "2018-03-13T00:00:00",
            "time_iso": "2018-03-13T00:00:00"
          },
          {
            "time": 1520985600,
            "value": 1981771,
            "datetime": "2018-03-14T00:00:00",
            "time_iso": "2018-03-14T00:00:00"
          },
          {
            "time": 1521072000,
            "value": 1983911,
            "datetime": "2018-03-15T00:00:00",
            "time_iso": "2018-03-15T00:00:00"
          },
          {
            "time": 1521158400,
            "value": 1986069,
            "datetime": "2018-03-16T00:00:00",
            "time_iso": "2018-03-16T00:00:00"
          },
          {
            "time": 1521244800,
            "value": 1988405,
            "datetime": "2018-03-17T00:00:00",
            "time_iso": "2018-03-17T00:00:00"
          },
          {
            "time": 1521331200,
            "value": 1990561,
            "datetime": "2018-03-18T00:00:00",
            "time_iso": "2018-03-18T00:00:00"
          },
          {
            "time": 1521417600,
            "value": 1992545,
            "datetime": "2018-03-19T00:00:00",
            "time_iso": "2018-03-19T00:00:00"
          },
          {
            "time": 1521504000,
            "value": 1994188,
            "datetime": "2018-03-20T00:00:00",
            "time_iso": "2018-03-20T00:00:00"
          },
          {
            "time": 1521590400,
            "value": 1996578,
            "datetime": "2018-03-21T00:00:00",
            "time_iso": "2018-03-21T00:00:00"
          },
          {
            "time": 1521676800,
            "value": 1998599,
            "datetime": "2018-03-22T00:00:00",
            "time_iso": "2018-03-22T00:00:00"
          },
          {
            "time": 1521763200,
            "value": 2000467,
            "datetime": "2018-03-23T00:00:00",
            "time_iso": "2018-03-23T00:00:00"
          },
          {
            "time": 1521849600,
            "value": 2002793,
            "datetime": "2018-03-24T00:00:00",
            "time_iso": "2018-03-24T00:00:00"
          },
          {
            "time": 1521936000,
            "value": 2005172,
            "datetime": "2018-03-25T00:00:00",
            "time_iso": "2018-03-25T00:00:00"
          },
          {
            "time": 1522022400,
            "value": 2007043,
            "datetime": "2018-03-26T00:00:00",
            "time_iso": "2018-03-26T00:00:00"
          },
          {
            "time": 1522108800,
            "value": 2009198,
            "datetime": "2018-03-27T00:00:00",
            "time_iso": "2018-03-27T00:00:00"
          },
          {
            "time": 1522195200,
            "value": 2011180,
            "datetime": "2018-03-28T00:00:00",
            "time_iso": "2018-03-28T00:00:00"
          },
          {
            "time": 1522281600,
            "value": 2013704,
            "datetime": "2018-03-29T00:00:00",
            "time_iso": "2018-03-29T00:00:00"
          },
          {
            "time": 1522368000,
            "value": 2016013,
            "datetime": "2018-03-30T00:00:00",
            "time_iso": "2018-03-30T00:00:00"
          },
          {
            "time": 1522454400,
            "value": 2018172,
            "datetime": "2018-03-31T00:00:00",
            "time_iso": "2018-03-31T00:00:00"
          },
          {
            "time": 1522540800,
            "value": 2021142,
            "datetime": "2018-04-01T00:00:00",
            "time_iso": "2018-04-01T00:00:00"
          },
          {
            "time": 1522627200,
            "value": 2024124,
            "datetime": "2018-04-02T00:00:00",
            "time_iso": "2018-04-02T00:00:00"
          },
          {
            "time": 1522713600,
            "value": 2026829,
            "datetime": "2018-04-03T00:00:00",
            "time_iso": "2018-04-03T00:00:00"
          },
          {
            "time": 1522800000,
            "value": 2029391,
            "datetime": "2018-04-04T00:00:00",
            "time_iso": "2018-04-04T00:00:00"
          },
          {
            "time": 1522886400,
            "value": 2031361,
            "datetime": "2018-04-05T00:00:00",
            "time_iso": "2018-04-05T00:00:00"
          },
          {
            "time": 1522972800,
            "value": 2032868,
            "datetime": "2018-04-06T00:00:00",
            "time_iso": "2018-04-06T00:00:00"
          },
          {
            "time": 1523059200,
            "value": 2035224,
            "datetime": "2018-04-07T00:00:00",
            "time_iso": "2018-04-07T00:00:00"
          },
          {
            "time": 1523145600,
            "value": 2037285,
            "datetime": "2018-04-08T00:00:00",
            "time_iso": "2018-04-08T00:00:00"
          },
          {
            "time": 1523232000,
            "value": 2039741,
            "datetime": "2018-04-09T00:00:00",
            "time_iso": "2018-04-09T00:00:00"
          },
          {
            "time": 1523318400,
            "value": 2042105,
            "datetime": "2018-04-10T00:00:00",
            "time_iso": "2018-04-10T00:00:00"
          },
          {
            "time": 1523404800,
            "value": 2044495,
            "datetime": "2018-04-11T00:00:00",
            "time_iso": "2018-04-11T00:00:00"
          },
          {
            "time": 1523491200,
            "value": 2046906,
            "datetime": "2018-04-12T00:00:00",
            "time_iso": "2018-04-12T00:00:00"
          },
          {
            "time": 1523577600,
            "value": 2049527,
            "datetime": "2018-04-13T00:00:00",
            "time_iso": "2018-04-13T00:00:00"
          },
          {
            "time": 1523664000,
            "value": 2052020,
            "datetime": "2018-04-14T00:00:00",
            "time_iso": "2018-04-14T00:00:00"
          },
          {
            "time": 1523750400,
            "value": 2054443,
            "datetime": "2018-04-15T00:00:00",
            "time_iso": "2018-04-15T00:00:00"
          },
          {
            "time": 1523836800,
            "value": 2056925,
            "datetime": "2018-04-16T00:00:00",
            "time_iso": "2018-04-16T00:00:00"
          },
          {
            "time": 1523923200,
            "value": 2058949,
            "datetime": "2018-04-17T00:00:00",
            "time_iso": "2018-04-17T00:00:00"
          },
          {
            "time": 1524009600,
            "value": 2061476,
            "datetime": "2018-04-18T00:00:00",
            "time_iso": "2018-04-18T00:00:00"
          },
          {
            "time": 1524096000,
            "value": 2063613,
            "datetime": "2018-04-19T00:00:00",
            "time_iso": "2018-04-19T00:00:00"
          },
          {
            "time": 1524182400,
            "value": 2065330,
            "datetime": "2018-04-20T00:00:00",
            "time_iso": "2018-04-20T00:00:00"
          },
          {
            "time": 1524268800,
            "value": 2067393,
            "datetime": "2018-04-21T00:00:00",
            "time_iso": "2018-04-21T00:00:00"
          },
          {
            "time": 1524355200,
            "value": 2070010,
            "datetime": "2018-04-22T00:00:00",
            "time_iso": "2018-04-22T00:00:00"
          },
          {
            "time": 1524441600,
            "value": 2071753,
            "datetime": "2018-04-23T00:00:00",
            "time_iso": "2018-04-23T00:00:00"
          },
          {
            "time": 1524528000,
            "value": 2073288,
            "datetime": "2018-04-24T00:00:00",
            "time_iso": "2018-04-24T00:00:00"
          },
          {
            "time": 1524614400,
            "value": 2074803,
            "datetime": "2018-04-25T00:00:00",
            "time_iso": "2018-04-25T00:00:00"
          },
          {
            "time": 1524700800,
            "value": 2076413,
            "datetime": "2018-04-26T00:00:00",
            "time_iso": "2018-04-26T00:00:00"
          },
          {
            "time": 1524787200,
            "value": 2077876,
            "datetime": "2018-04-27T00:00:00",
            "time_iso": "2018-04-27T00:00:00"
          },
          {
            "time": 1524873600,
            "value": 2079522,
            "datetime": "2018-04-28T00:00:00",
            "time_iso": "2018-04-28T00:00:00"
          },
          {
            "time": 1524960000,
            "value": 2081568,
            "datetime": "2018-04-29T00:00:00",
            "time_iso": "2018-04-29T00:00:00"
          },
          {
            "time": 1525046400,
            "value": 2083504,
            "datetime": "2018-04-30T00:00:00",
            "time_iso": "2018-04-30T00:00:00"
          },
          {
            "time": 1525132800,
            "value": 2085336,
            "datetime": "2018-05-01T00:00:00",
            "time_iso": "2018-05-01T00:00:00"
          },
          {
            "time": 1525219200,
            "value": 2086868,
            "datetime": "2018-05-02T00:00:00",
            "time_iso": "2018-05-02T00:00:00"
          },
          {
            "time": 1525305600,
            "value": 2088440,
            "datetime": "2018-05-03T00:00:00",
            "time_iso": "2018-05-03T00:00:00"
          },
          {
            "time": 1525392000,
            "value": 2090352,
            "datetime": "2018-05-04T00:00:00",
            "time_iso": "2018-05-04T00:00:00"
          },
          {
            "time": 1525478400,
            "value": 2093896,
            "datetime": "2018-05-05T00:00:00",
            "time_iso": "2018-05-05T00:00:00"
          },
          {
            "time": 1525564800,
            "value": 2097088,
            "datetime": "2018-05-06T00:00:00",
            "time_iso": "2018-05-06T00:00:00"
          },
          {
            "time": 1525651200,
            "value": 2099097,
            "datetime": "2018-05-07T00:00:00",
            "time_iso": "2018-05-07T00:00:00"
          },
          {
            "time": 1525737600,
            "value": 2101134,
            "datetime": "2018-05-08T00:00:00",
            "time_iso": "2018-05-08T00:00:00"
          },
          {
            "time": 1525824000,
            "value": 2102935,
            "datetime": "2018-05-09T00:00:00",
            "time_iso": "2018-05-09T00:00:00"
          },
          {
            "time": 1525910400,
            "value": 2106558,
            "datetime": "2018-05-10T00:00:00",
            "time_iso": "2018-05-10T00:00:00"
          },
          {
            "time": 1525996800,
            "value": 2112099,
            "datetime": "2018-05-11T00:00:00",
            "time_iso": "2018-05-11T00:00:00"
          },
          {
            "time": 1526083200,
            "value": 2115772,
            "datetime": "2018-05-12T00:00:00",
            "time_iso": "2018-05-12T00:00:00"
          },
          {
            "time": 1526169600,
            "value": 2118998,
            "datetime": "2018-05-13T00:00:00",
            "time_iso": "2018-05-13T00:00:00"
          },
          {
            "time": 1526256000,
            "value": 2122221,
            "datetime": "2018-05-14T00:00:00",
            "time_iso": "2018-05-14T00:00:00"
          },
          {
            "time": 1526342400,
            "value": 2124152,
            "datetime": "2018-05-15T00:00:00",
            "time_iso": "2018-05-15T00:00:00"
          },
          {
            "time": 1526428800,
            "value": 2126172,
            "datetime": "2018-05-16T00:00:00",
            "time_iso": "2018-05-16T00:00:00"
          },
          {
            "time": 1526515200,
            "value": 2127912,
            "datetime": "2018-05-17T00:00:00",
            "time_iso": "2018-05-17T00:00:00"
          },
          {
            "time": 1526601600,
            "value": 2129740,
            "datetime": "2018-05-18T00:00:00",
            "time_iso": "2018-05-18T00:00:00"
          },
          {
            "time": 1526688000,
            "value": 2131707,
            "datetime": "2018-05-19T00:00:00",
            "time_iso": "2018-05-19T00:00:00"
          },
          {
            "time": 1526774400,
            "value": 2133432,
            "datetime": "2018-05-20T00:00:00",
            "time_iso": "2018-05-20T00:00:00"
          },
          {
            "time": 1526860800,
            "value": 2135425,
            "datetime": "2018-05-21T00:00:00",
            "time_iso": "2018-05-21T00:00:00"
          },
          {
            "time": 1526947200,
            "value": 2137279,
            "datetime": "2018-05-22T00:00:00",
            "time_iso": "2018-05-22T00:00:00"
          },
          {
            "time": 1527033600,
            "value": 2139003,
            "datetime": "2018-05-23T00:00:00",
            "time_iso": "2018-05-23T00:00:00"
          },
          {
            "time": 1527120000,
            "value": 2140731,
            "datetime": "2018-05-24T00:00:00",
            "time_iso": "2018-05-24T00:00:00"
          },
          {
            "time": 1527206400,
            "value": 2141936,
            "datetime": "2018-05-25T00:00:00",
            "time_iso": "2018-05-25T00:00:00"
          },
          {
            "time": 1527292800,
            "value": 2143423,
            "datetime": "2018-05-26T00:00:00",
            "time_iso": "2018-05-26T00:00:00"
          },
          {
            "time": 1527379200,
            "value": 2144894,
            "datetime": "2018-05-27T00:00:00",
            "time_iso": "2018-05-27T00:00:00"
          },
          {
            "time": 1527465600,
            "value": 2146510,
            "datetime": "2018-05-28T00:00:00",
            "time_iso": "2018-05-28T00:00:00"
          },
          {
            "time": 1527552000,
            "value": 2147992,
            "datetime": "2018-05-29T00:00:00",
            "time_iso": "2018-05-29T00:00:00"
          },
          {
            "time": 1527638400,
            "value": 2149368,
            "datetime": "2018-05-30T00:00:00",
            "time_iso": "2018-05-30T00:00:00"
          },
          {
            "time": 1527724800,
            "value": 2150942,
            "datetime": "2018-05-31T00:00:00",
            "time_iso": "2018-05-31T00:00:00"
          },
          {
            "time": 1527811200,
            "value": 2152376,
            "datetime": "2018-06-01T00:00:00",
            "time_iso": "2018-06-01T00:00:00"
          },
          {
            "time": 1527897600,
            "value": 2154021,
            "datetime": "2018-06-02T00:00:00",
            "time_iso": "2018-06-02T00:00:00"
          },
          {
            "time": 1527984000,
            "value": 2156562,
            "datetime": "2018-06-03T00:00:00",
            "time_iso": "2018-06-03T00:00:00"
          },
          {
            "time": 1528070400,
            "value": 2158501,
            "datetime": "2018-06-04T00:00:00",
            "time_iso": "2018-06-04T00:00:00"
          },
          {
            "time": 1528156800,
            "value": 2160762,
            "datetime": "2018-06-05T00:00:00",
            "time_iso": "2018-06-05T00:00:00"
          },
          {
            "time": 1528243200,
            "value": 2165598,
            "datetime": "2018-06-06T00:00:00",
            "time_iso": "2018-06-06T00:00:00"
          },
          {
            "time": 1528329600,
            "value": 2172817,
            "datetime": "2018-06-07T00:00:00",
            "time_iso": "2018-06-07T00:00:00"
          },
          {
            "time": 1528416000,
            "value": 2176235,
            "datetime": "2018-06-08T00:00:00",
            "time_iso": "2018-06-08T00:00:00"
          },
          {
            "time": 1528502400,
            "value": 2178836,
            "datetime": "2018-06-09T00:00:00",
            "time_iso": "2018-06-09T00:00:00"
          },
          {
            "time": 1528588800,
            "value": 2181982,
            "datetime": "2018-06-10T00:00:00",
            "time_iso": "2018-06-10T00:00:00"
          },
          {
            "time": 1528675200,
            "value": 2184136,
            "datetime": "2018-06-11T00:00:00",
            "time_iso": "2018-06-11T00:00:00"
          },
          {
            "time": 1528761600,
            "value": 2186151,
            "datetime": "2018-06-12T00:00:00",
            "time_iso": "2018-06-12T00:00:00"
          },
          {
            "time": 1528848000,
            "value": 2188258,
            "datetime": "2018-06-13T00:00:00",
            "time_iso": "2018-06-13T00:00:00"
          },
          {
            "time": 1528934400,
            "value": 2190923,
            "datetime": "2018-06-14T00:00:00",
            "time_iso": "2018-06-14T00:00:00"
          },
          {
            "time": 1529020800,
            "value": 2192880,
            "datetime": "2018-06-15T00:00:00",
            "time_iso": "2018-06-15T00:00:00"
          },
          {
            "time": 1529107200,
            "value": 2194599,
            "datetime": "2018-06-16T00:00:00",
            "time_iso": "2018-06-16T00:00:00"
          },
          {
            "time": 1529193600,
            "value": 2196466,
            "datetime": "2018-06-17T00:00:00",
            "time_iso": "2018-06-17T00:00:00"
          },
          {
            "time": 1529280000,
            "value": 2198499,
            "datetime": "2018-06-18T00:00:00",
            "time_iso": "2018-06-18T00:00:00"
          },
          {
            "time": 1529366400,
            "value": 2200364,
            "datetime": "2018-06-19T00:00:00",
            "time_iso": "2018-06-19T00:00:00"
          },
          {
            "time": 1529452800,
            "value": 2202060,
            "datetime": "2018-06-20T00:00:00",
            "time_iso": "2018-06-20T00:00:00"
          },
          {
            "time": 1529539200,
            "value": 2203861,
            "datetime": "2018-06-21T00:00:00",
            "time_iso": "2018-06-21T00:00:00"
          },
          {
            "time": 1529625600,
            "value": 2205377,
            "datetime": "2018-06-22T00:00:00",
            "time_iso": "2018-06-22T00:00:00"
          },
          {
            "time": 1529712000,
            "value": 2207174,
            "datetime": "2018-06-23T00:00:00",
            "time_iso": "2018-06-23T00:00:00"
          },
          {
            "time": 1529798400,
            "value": 2209004,
            "datetime": "2018-06-24T00:00:00",
            "time_iso": "2018-06-24T00:00:00"
          },
          {
            "time": 1529884800,
            "value": 2210724,
            "datetime": "2018-06-25T00:00:00",
            "time_iso": "2018-06-25T00:00:00"
          },
          {
            "time": 1529971200,
            "value": 2212490,
            "datetime": "2018-06-26T00:00:00",
            "time_iso": "2018-06-26T00:00:00"
          },
          {
            "time": 1530057600,
            "value": 2214212,
            "datetime": "2018-06-27T00:00:00",
            "time_iso": "2018-06-27T00:00:00"
          },
          {
            "time": 1530144000,
            "value": 2216349,
            "datetime": "2018-06-28T00:00:00",
            "time_iso": "2018-06-28T00:00:00"
          },
          {
            "time": 1530230400,
            "value": 2219148,
            "datetime": "2018-06-29T00:00:00",
            "time_iso": "2018-06-29T00:00:00"
          },
          {
            "time": 1530316800,
            "value": 2221529,
            "datetime": "2018-06-30T00:00:00",
            "time_iso": "2018-06-30T00:00:00"
          },
          {
            "time": 1530403200,
            "value": 2223959,
            "datetime": "2018-07-01T00:00:00",
            "time_iso": "2018-07-01T00:00:00"
          },
          {
            "time": 1530489600,
            "value": 2226416,
            "datetime": "2018-07-02T00:00:00",
            "time_iso": "2018-07-02T00:00:00"
          },
          {
            "time": 1530576000,
            "value": 2228469,
            "datetime": "2018-07-03T00:00:00",
            "time_iso": "2018-07-03T00:00:00"
          },
          {
            "time": 1530662400,
            "value": 2231086,
            "datetime": "2018-07-04T00:00:00",
            "time_iso": "2018-07-04T00:00:00"
          },
          {
            "time": 1530748800,
            "value": 2234191,
            "datetime": "2018-07-05T00:00:00",
            "time_iso": "2018-07-05T00:00:00"
          },
          {
            "time": 1530835200,
            "value": 2236702,
            "datetime": "2018-07-06T00:00:00",
            "time_iso": "2018-07-06T00:00:00"
          },
          {
            "time": 1530921600,
            "value": 2239415,
            "datetime": "2018-07-07T00:00:00",
            "time_iso": "2018-07-07T00:00:00"
          },
          {
            "time": 1531008000,
            "value": 2242263,
            "datetime": "2018-07-08T00:00:00",
            "time_iso": "2018-07-08T00:00:00"
          },
          {
            "time": 1531094400,
            "value": 2245130,
            "datetime": "2018-07-09T00:00:00",
            "time_iso": "2018-07-09T00:00:00"
          },
          {
            "time": 1531180800,
            "value": 2247461,
            "datetime": "2018-07-10T00:00:00",
            "time_iso": "2018-07-10T00:00:00"
          },
          {
            "time": 1531267200,
            "value": 2250240,
            "datetime": "2018-07-11T00:00:00",
            "time_iso": "2018-07-11T00:00:00"
          },
          {
            "time": 1531353600,
            "value": 2252249,
            "datetime": "2018-07-12T00:00:00",
            "time_iso": "2018-07-12T00:00:00"
          },
          {
            "time": 1531440000,
            "value": 2254854,
            "datetime": "2018-07-13T00:00:00",
            "time_iso": "2018-07-13T00:00:00"
          },
          {
            "time": 1531526400,
            "value": 2257063,
            "datetime": "2018-07-14T00:00:00",
            "time_iso": "2018-07-14T00:00:00"
          },
          {
            "time": 1531612800,
            "value": 2259483,
            "datetime": "2018-07-15T00:00:00",
            "time_iso": "2018-07-15T00:00:00"
          },
          {
            "time": 1531699200,
            "value": 2261754,
            "datetime": "2018-07-16T00:00:00",
            "time_iso": "2018-07-16T00:00:00"
          },
          {
            "time": 1531785600,
            "value": 2263504,
            "datetime": "2018-07-17T00:00:00",
            "time_iso": "2018-07-17T00:00:00"
          },
          {
            "time": 1531872000,
            "value": 2265830,
            "datetime": "2018-07-18T00:00:00",
            "time_iso": "2018-07-18T00:00:00"
          },
          {
            "time": 1531958400,
            "value": 2268276,
            "datetime": "2018-07-19T00:00:00",
            "time_iso": "2018-07-19T00:00:00"
          },
          {
            "time": 1532044800,
            "value": 2270763,
            "datetime": "2018-07-20T00:00:00",
            "time_iso": "2018-07-20T00:00:00"
          },
          {
            "time": 1532131200,
            "value": 2273523,
            "datetime": "2018-07-21T00:00:00",
            "time_iso": "2018-07-21T00:00:00"
          },
          {
            "time": 1532217600,
            "value": 2276361,
            "datetime": "2018-07-22T00:00:00",
            "time_iso": "2018-07-22T00:00:00"
          },
          {
            "time": 1532304000,
            "value": 2278845,
            "datetime": "2018-07-23T00:00:00",
            "time_iso": "2018-07-23T00:00:00"
          },
          {
            "time": 1532390400,
            "value": 2281429,
            "datetime": "2018-07-24T00:00:00",
            "time_iso": "2018-07-24T00:00:00"
          },
          {
            "time": 1532476800,
            "value": 2284467,
            "datetime": "2018-07-25T00:00:00",
            "time_iso": "2018-07-25T00:00:00"
          },
          {
            "time": 1532563200,
            "value": 2288130,
            "datetime": "2018-07-26T00:00:00",
            "time_iso": "2018-07-26T00:00:00"
          },
          {
            "time": 1532649600,
            "value": 2383532,
            "datetime": "2018-07-27T00:00:00",
            "time_iso": "2018-07-27T00:00:00"
          },
          {
            "time": 1532736000,
            "value": 2413890,
            "datetime": "2018-07-28T00:00:00",
            "time_iso": "2018-07-28T00:00:00"
          },
          {
            "time": 1532822400,
            "value": 2422236,
            "datetime": "2018-07-29T00:00:00",
            "time_iso": "2018-07-29T00:00:00"
          },
          {
            "time": 1532908800,
            "value": 2426711,
            "datetime": "2018-07-30T00:00:00",
            "time_iso": "2018-07-30T00:00:00"
          },
          {
            "time": 1532995200,
            "value": 2433820,
            "datetime": "2018-07-31T00:00:00",
            "time_iso": "2018-07-31T00:00:00"
          },
          {
            "time": 1533081600,
            "value": 2438683,
            "datetime": "2018-08-01T00:00:00",
            "time_iso": "2018-08-01T00:00:00"
          },
          {
            "time": 1533168000,
            "value": 2442667,
            "datetime": "2018-08-02T00:00:00",
            "time_iso": "2018-08-02T00:00:00"
          },
          {
            "time": 1533254400,
            "value": 2447193,
            "datetime": "2018-08-03T00:00:00",
            "time_iso": "2018-08-03T00:00:00"
          },
          {
            "time": 1533340800,
            "value": 2452446,
            "datetime": "2018-08-04T00:00:00",
            "time_iso": "2018-08-04T00:00:00"
          },
          {
            "time": 1533427200,
            "value": 2457751,
            "datetime": "2018-08-05T00:00:00",
            "time_iso": "2018-08-05T00:00:00"
          },
          {
            "time": 1533513600,
            "value": 2462544,
            "datetime": "2018-08-06T00:00:00",
            "time_iso": "2018-08-06T00:00:00"
          },
          {
            "time": 1533600000,
            "value": 2467381,
            "datetime": "2018-08-07T00:00:00",
            "time_iso": "2018-08-07T00:00:00"
          },
          {
            "time": 1533686400,
            "value": 2472207,
            "datetime": "2018-08-08T00:00:00",
            "time_iso": "2018-08-08T00:00:00"
          },
          {
            "time": 1533772800,
            "value": 2476326,
            "datetime": "2018-08-09T00:00:00",
            "time_iso": "2018-08-09T00:00:00"
          },
          {
            "time": 1533859200,
            "value": 2481637,
            "datetime": "2018-08-10T00:00:00",
            "time_iso": "2018-08-10T00:00:00"
          },
          {
            "time": 1533945600,
            "value": 2499560,
            "datetime": "2018-08-11T00:00:00",
            "time_iso": "2018-08-11T00:00:00"
          },
          {
            "time": 1534032000,
            "value": 2517810,
            "datetime": "2018-08-12T00:00:00",
            "time_iso": "2018-08-12T00:00:00"
          },
          {
            "time": 1534118400,
            "value": 2525839,
            "datetime": "2018-08-13T00:00:00",
            "time_iso": "2018-08-13T00:00:00"
          },
          {
            "time": 1534204800,
            "value": 2531222,
            "datetime": "2018-08-14T00:00:00",
            "time_iso": "2018-08-14T00:00:00"
          },
          {
            "time": 1534291200,
            "value": 2536376,
            "datetime": "2018-08-15T00:00:00",
            "time_iso": "2018-08-15T00:00:00"
          },
          {
            "time": 1534377600,
            "value": 2540649,
            "datetime": "2018-08-16T00:00:00",
            "time_iso": "2018-08-16T00:00:00"
          },
          {
            "time": 1534464000,
            "value": 2544625,
            "datetime": "2018-08-17T00:00:00",
            "time_iso": "2018-08-17T00:00:00"
          },
          {
            "time": 1534550400,
            "value": 2549453,
            "datetime": "2018-08-18T00:00:00",
            "time_iso": "2018-08-18T00:00:00"
          },
          {
            "time": 1534636800,
            "value": 2553589,
            "datetime": "2018-08-19T00:00:00",
            "time_iso": "2018-08-19T00:00:00"
          },
          {
            "time": 1534723200,
            "value": 2557892,
            "datetime": "2018-08-20T00:00:00",
            "time_iso": "2018-08-20T00:00:00"
          },
          {
            "time": 1534809600,
            "value": 2561532,
            "datetime": "2018-08-21T00:00:00",
            "time_iso": "2018-08-21T00:00:00"
          },
          {
            "time": 1534896000,
            "value": 2565679,
            "datetime": "2018-08-22T00:00:00",
            "time_iso": "2018-08-22T00:00:00"
          },
          {
            "time": 1534982400,
            "value": 2569989,
            "datetime": "2018-08-23T00:00:00",
            "time_iso": "2018-08-23T00:00:00"
          },
          {
            "time": 1535068800,
            "value": 2575364,
            "datetime": "2018-08-24T00:00:00",
            "time_iso": "2018-08-24T00:00:00"
          },
          {
            "time": 1535155200,
            "value": 2580339,
            "datetime": "2018-08-25T00:00:00",
            "time_iso": "2018-08-25T00:00:00"
          },
          {
            "time": 1535241600,
            "value": 2584908,
            "datetime": "2018-08-26T00:00:00",
            "time_iso": "2018-08-26T00:00:00"
          },
          {
            "time": 1535328000,
            "value": 2589694,
            "datetime": "2018-08-27T00:00:00",
            "time_iso": "2018-08-27T00:00:00"
          },
          {
            "time": 1535414400,
            "value": 2593106,
            "datetime": "2018-08-28T00:00:00",
            "time_iso": "2018-08-28T00:00:00"
          },
          {
            "time": 1535500800,
            "value": 2595914,
            "datetime": "2018-08-29T00:00:00",
            "time_iso": "2018-08-29T00:00:00"
          },
          {
            "time": 1535587200,
            "value": 2600275,
            "datetime": "2018-08-30T00:00:00",
            "time_iso": "2018-08-30T00:00:00"
          },
          {
            "time": 1535673600,
            "value": 2628606,
            "datetime": "2018-08-31T00:00:00",
            "time_iso": "2018-08-31T00:00:00"
          },
          {
            "time": 1535760000,
            "value": 2640838,
            "datetime": "2018-09-01T00:00:00",
            "time_iso": "2018-09-01T00:00:00"
          },
          {
            "time": 1535846400,
            "value": 2646356,
            "datetime": "2018-09-02T00:00:00",
            "time_iso": "2018-09-02T00:00:00"
          },
          {
            "time": 1535932800,
            "value": 2650008,
            "datetime": "2018-09-03T00:00:00",
            "time_iso": "2018-09-03T00:00:00"
          },
          {
            "time": 1536019200,
            "value": 2652435,
            "datetime": "2018-09-04T00:00:00",
            "time_iso": "2018-09-04T00:00:00"
          },
          {
            "time": 1536105600,
            "value": 2654867,
            "datetime": "2018-09-05T00:00:00",
            "time_iso": "2018-09-05T00:00:00"
          },
          {
            "time": 1536192000,
            "value": 2656984,
            "datetime": "2018-09-06T00:00:00",
            "time_iso": "2018-09-06T00:00:00"
          },
          {
            "time": 1536278400,
            "value": 2661246,
            "datetime": "2018-09-07T00:00:00",
            "time_iso": "2018-09-07T00:00:00"
          },
          {
            "time": 1536364800,
            "value": 2664157,
            "datetime": "2018-09-08T00:00:00",
            "time_iso": "2018-09-08T00:00:00"
          },
          {
            "time": 1536451200,
            "value": 2667077,
            "datetime": "2018-09-09T00:00:00",
            "time_iso": "2018-09-09T00:00:00"
          },
          {
            "time": 1536537600,
            "value": 2669775,
            "datetime": "2018-09-10T00:00:00",
            "time_iso": "2018-09-10T00:00:00"
          },
          {
            "time": 1536624000,
            "value": 2672491,
            "datetime": "2018-09-11T00:00:00",
            "time_iso": "2018-09-11T00:00:00"
          },
          {
            "time": 1536710400,
            "value": 2676049,
            "datetime": "2018-09-12T00:00:00",
            "time_iso": "2018-09-12T00:00:00"
          },
          {
            "time": 1536796800,
            "value": 2679612,
            "datetime": "2018-09-13T00:00:00",
            "time_iso": "2018-09-13T00:00:00"
          },
          {
            "time": 1536883200,
            "value": 2683332,
            "datetime": "2018-09-14T00:00:00",
            "time_iso": "2018-09-14T00:00:00"
          },
          {
            "time": 1536969600,
            "value": 2687464,
            "datetime": "2018-09-15T00:00:00",
            "time_iso": "2018-09-15T00:00:00"
          },
          {
            "time": 1537056000,
            "value": 2691114,
            "datetime": "2018-09-16T00:00:00",
            "time_iso": "2018-09-16T00:00:00"
          },
          {
            "time": 1537142400,
            "value": 2693842,
            "datetime": "2018-09-17T00:00:00",
            "time_iso": "2018-09-17T00:00:00"
          },
          {
            "time": 1537228800,
            "value": 2696400,
            "datetime": "2018-09-18T00:00:00",
            "time_iso": "2018-09-18T00:00:00"
          },
          {
            "time": 1537315200,
            "value": 2698253,
            "datetime": "2018-09-19T00:00:00",
            "time_iso": "2018-09-19T00:00:00"
          },
          {
            "time": 1537401600,
            "value": 2701454,
            "datetime": "2018-09-20T00:00:00",
            "time_iso": "2018-09-20T00:00:00"
          },
          {
            "time": 1537488000,
            "value": 2704310,
            "datetime": "2018-09-21T00:00:00",
            "time_iso": "2018-09-21T00:00:00"
          },
          {
            "time": 1537574400,
            "value": 2707319,
            "datetime": "2018-09-22T00:00:00",
            "time_iso": "2018-09-22T00:00:00"
          },
          {
            "time": 1537660800,
            "value": 2710341,
            "datetime": "2018-09-23T00:00:00",
            "time_iso": "2018-09-23T00:00:00"
          },
          {
            "time": 1537747200,
            "value": 2712608,
            "datetime": "2018-09-24T00:00:00",
            "time_iso": "2018-09-24T00:00:00"
          },
          {
            "time": 1537833600,
            "value": 2715523,
            "datetime": "2018-09-25T00:00:00",
            "time_iso": "2018-09-25T00:00:00"
          },
          {
            "time": 1537920000,
            "value": 2718512,
            "datetime": "2018-09-26T00:00:00",
            "time_iso": "2018-09-26T00:00:00"
          },
          {
            "time": 1538006400,
            "value": 2721766,
            "datetime": "2018-09-27T00:00:00",
            "time_iso": "2018-09-27T00:00:00"
          },
          {
            "time": 1538092800,
            "value": 2724652,
            "datetime": "2018-09-28T00:00:00",
            "time_iso": "2018-09-28T00:00:00"
          },
          {
            "time": 1538179200,
            "value": 2727468,
            "datetime": "2018-09-29T00:00:00",
            "time_iso": "2018-09-29T00:00:00"
          },
          {
            "time": 1538265600,
            "value": 2730090,
            "datetime": "2018-09-30T00:00:00",
            "time_iso": "2018-09-30T00:00:00"
          },
          {
            "time": 1538352000,
            "value": 2732246,
            "datetime": "2018-10-01T00:00:00",
            "time_iso": "2018-10-01T00:00:00"
          },
          {
            "time": 1538438400,
            "value": 2734609,
            "datetime": "2018-10-02T00:00:00",
            "time_iso": "2018-10-02T00:00:00"
          },
          {
            "time": 1538524800,
            "value": 2736895,
            "datetime": "2018-10-03T00:00:00",
            "time_iso": "2018-10-03T00:00:00"
          },
          {
            "time": 1538611200,
            "value": 2739878,
            "datetime": "2018-10-04T00:00:00",
            "time_iso": "2018-10-04T00:00:00"
          },
          {
            "time": 1538697600,
            "value": 2741485,
            "datetime": "2018-10-05T00:00:00",
            "time_iso": "2018-10-05T00:00:00"
          },
          {
            "time": 1538784000,
            "value": 2744851,
            "datetime": "2018-10-06T00:00:00",
            "time_iso": "2018-10-06T00:00:00"
          },
          {
            "time": 1538870400,
            "value": 2750394,
            "datetime": "2018-10-07T00:00:00",
            "time_iso": "2018-10-07T00:00:00"
          },
          {
            "time": 1538956800,
            "value": 2754605,
            "datetime": "2018-10-08T00:00:00",
            "time_iso": "2018-10-08T00:00:00"
          },
          {
            "time": 1539043200,
            "value": 2759020,
            "datetime": "2018-10-09T00:00:00",
            "time_iso": "2018-10-09T00:00:00"
          },
          {
            "time": 1539129600,
            "value": 2763309,
            "datetime": "2018-10-10T00:00:00",
            "time_iso": "2018-10-10T00:00:00"
          },
          {
            "time": 1539216000,
            "value": 2769053,
            "datetime": "2018-10-11T00:00:00",
            "time_iso": "2018-10-11T00:00:00"
          },
          {
            "time": 1539302400,
            "value": 2773173,
            "datetime": "2018-10-12T00:00:00",
            "time_iso": "2018-10-12T00:00:00"
          },
          {
            "time": 1539388800,
            "value": 2775568,
            "datetime": "2018-10-13T00:00:00",
            "time_iso": "2018-10-13T00:00:00"
          },
          {
            "time": 1539475200,
            "value": 2778523,
            "datetime": "2018-10-14T00:00:00",
            "time_iso": "2018-10-14T00:00:00"
          },
          {
            "time": 1539561600,
            "value": 2780722,
            "datetime": "2018-10-15T00:00:00",
            "time_iso": "2018-10-15T00:00:00"
          },
          {
            "time": 1539648000,
            "value": 2782818,
            "datetime": "2018-10-16T00:00:00",
            "time_iso": "2018-10-16T00:00:00"
          },
          {
            "time": 1539734400,
            "value": 2785007,
            "datetime": "2018-10-17T00:00:00",
            "time_iso": "2018-10-17T00:00:00"
          },
          {
            "time": 1539820800,
            "value": 2787502,
            "datetime": "2018-10-18T00:00:00",
            "time_iso": "2018-10-18T00:00:00"
          },
          {
            "time": 1539907200,
            "value": 2789464,
            "datetime": "2018-10-19T00:00:00",
            "time_iso": "2018-10-19T00:00:00"
          },
          {
            "time": 1539993600,
            "value": 2792337,
            "datetime": "2018-10-20T00:00:00",
            "time_iso": "2018-10-20T00:00:00"
          },
          {
            "time": 1540080000,
            "value": 2795347,
            "datetime": "2018-10-21T00:00:00",
            "time_iso": "2018-10-21T00:00:00"
          },
          {
            "time": 1540166400,
            "value": 2797662,
            "datetime": "2018-10-22T00:00:00",
            "time_iso": "2018-10-22T00:00:00"
          },
          {
            "time": 1540252800,
            "value": 2799739,
            "datetime": "2018-10-23T00:00:00",
            "time_iso": "2018-10-23T00:00:00"
          },
          {
            "time": 1540339200,
            "value": 2802079,
            "datetime": "2018-10-24T00:00:00",
            "time_iso": "2018-10-24T00:00:00"
          },
          {
            "time": 1540425600,
            "value": 2804574,
            "datetime": "2018-10-25T00:00:00",
            "time_iso": "2018-10-25T00:00:00"
          },
          {
            "time": 1540512000,
            "value": 2806706,
            "datetime": "2018-10-26T00:00:00",
            "time_iso": "2018-10-26T00:00:00"
          },
          {
            "time": 1540598400,
            "value": 2809522,
            "datetime": "2018-10-27T00:00:00",
            "time_iso": "2018-10-27T00:00:00"
          },
          {
            "time": 1540684800,
            "value": 2812201,
            "datetime": "2018-10-28T00:00:00",
            "time_iso": "2018-10-28T00:00:00"
          },
          {
            "time": 1540771200,
            "value": 2814684,
            "datetime": "2018-10-29T00:00:00",
            "time_iso": "2018-10-29T00:00:00"
          },
          {
            "time": 1540857600,
            "value": 2817075,
            "datetime": "2018-10-30T00:00:00",
            "time_iso": "2018-10-30T00:00:00"
          },
          {
            "time": 1540944000,
            "value": 2819313,
            "datetime": "2018-10-31T00:00:00",
            "time_iso": "2018-10-31T00:00:00"
          },
          {
            "time": 1541030400,
            "value": 2821603,
            "datetime": "2018-11-01T00:00:00",
            "time_iso": "2018-11-01T00:00:00"
          },
          {
            "time": 1541116800,
            "value": 2824357,
            "datetime": "2018-11-02T00:00:00",
            "time_iso": "2018-11-02T00:00:00"
          },
          {
            "time": 1541203200,
            "value": 2827416,
            "datetime": "2018-11-03T00:00:00",
            "time_iso": "2018-11-03T00:00:00"
          },
          {
            "time": 1541289600,
            "value": 2831234,
            "datetime": "2018-11-04T00:00:00",
            "time_iso": "2018-11-04T00:00:00"
          },
          {
            "time": 1541376000,
            "value": 2834391,
            "datetime": "2018-11-05T00:00:00",
            "time_iso": "2018-11-05T00:00:00"
          },
          {
            "time": 1541462400,
            "value": 2837257,
            "datetime": "2018-11-06T00:00:00",
            "time_iso": "2018-11-06T00:00:00"
          },
          {
            "time": 1541548800,
            "value": 2840408,
            "datetime": "2018-11-07T00:00:00",
            "time_iso": "2018-11-07T00:00:00"
          },
          {
            "time": 1541635200,
            "value": 2843275,
            "datetime": "2018-11-08T00:00:00",
            "time_iso": "2018-11-08T00:00:00"
          },
          {
            "time": 1541721600,
            "value": 2845979,
            "datetime": "2018-11-09T00:00:00",
            "time_iso": "2018-11-09T00:00:00"
          },
          {
            "time": 1541808000,
            "value": 2848973,
            "datetime": "2018-11-10T00:00:00",
            "time_iso": "2018-11-10T00:00:00"
          },
          {
            "time": 1541894400,
            "value": 2852013,
            "datetime": "2018-11-11T00:00:00",
            "time_iso": "2018-11-11T00:00:00"
          },
          {
            "time": 1541980800,
            "value": 2854862,
            "datetime": "2018-11-12T00:00:00",
            "time_iso": "2018-11-12T00:00:00"
          },
          {
            "time": 1542067200,
            "value": 2857441,
            "datetime": "2018-11-13T00:00:00",
            "time_iso": "2018-11-13T00:00:00"
          },
          {
            "time": 1542153600,
            "value": 2860155,
            "datetime": "2018-11-14T00:00:00",
            "time_iso": "2018-11-14T00:00:00"
          },
          {
            "time": 1542240000,
            "value": 2862614,
            "datetime": "2018-11-15T00:00:00",
            "time_iso": "2018-11-15T00:00:00"
          },
          {
            "time": 1542326400,
            "value": 2866166,
            "datetime": "2018-11-16T00:00:00",
            "time_iso": "2018-11-16T00:00:00"
          },
          {
            "time": 1542412800,
            "value": 2875210,
            "datetime": "2018-11-17T00:00:00",
            "time_iso": "2018-11-17T00:00:00"
          },
          {
            "time": 1542499200,
            "value": 2882907,
            "datetime": "2018-11-18T00:00:00",
            "time_iso": "2018-11-18T00:00:00"
          },
          {
            "time": 1542585600,
            "value": 2892820,
            "datetime": "2018-11-19T00:00:00",
            "time_iso": "2018-11-19T00:00:00"
          },
          {
            "time": 1542672000,
            "value": 2897194,
            "datetime": "2018-11-20T00:00:00",
            "time_iso": "2018-11-20T00:00:00"
          },
          {
            "time": 1542758400,
            "value": 2900908,
            "datetime": "2018-11-21T00:00:00",
            "time_iso": "2018-11-21T00:00:00"
          },
          {
            "time": 1542844800,
            "value": 2904051,
            "datetime": "2018-11-22T00:00:00",
            "time_iso": "2018-11-22T00:00:00"
          },
          {
            "time": 1542931200,
            "value": 2906921,
            "datetime": "2018-11-23T00:00:00",
            "time_iso": "2018-11-23T00:00:00"
          },
          {
            "time": 1543017600,
            "value": 2911734,
            "datetime": "2018-11-24T00:00:00",
            "time_iso": "2018-11-24T00:00:00"
          },
          {
            "time": 1543104000,
            "value": 2917403,
            "datetime": "2018-11-25T00:00:00",
            "time_iso": "2018-11-25T00:00:00"
          },
          {
            "time": 1543190400,
            "value": 2947141,
            "datetime": "2018-11-26T00:00:00",
            "time_iso": "2018-11-26T00:00:00"
          },
          {
            "time": 1543276800,
            "value": 2964186,
            "datetime": "2018-11-27T00:00:00",
            "time_iso": "2018-11-27T00:00:00"
          },
          {
            "time": 1543363200,
            "value": 2973696,
            "datetime": "2018-11-28T00:00:00",
            "time_iso": "2018-11-28T00:00:00"
          },
          {
            "time": 1543449600,
            "value": 2979807,
            "datetime": "2018-11-29T00:00:00",
            "time_iso": "2018-11-29T00:00:00"
          },
          {
            "time": 1543536000,
            "value": 2985029,
            "datetime": "2018-11-30T00:00:00",
            "time_iso": "2018-11-30T00:00:00"
          },
          {
            "time": 1543622400,
            "value": 2990424,
            "datetime": "2018-12-01T00:00:00",
            "time_iso": "2018-12-01T00:00:00"
          },
          {
            "time": 1543708800,
            "value": 2996676,
            "datetime": "2018-12-02T00:00:00",
            "time_iso": "2018-12-02T00:00:00"
          },
          {
            "time": 1543795200,
            "value": 3005532,
            "datetime": "2018-12-03T00:00:00",
            "time_iso": "2018-12-03T00:00:00"
          },
          {
            "time": 1543881600,
            "value": 3012481,
            "datetime": "2018-12-04T00:00:00",
            "time_iso": "2018-12-04T00:00:00"
          },
          {
            "time": 1543968000,
            "value": 3020698,
            "datetime": "2018-12-05T00:00:00",
            "time_iso": "2018-12-05T00:00:00"
          },
          {
            "time": 1544054400,
            "value": 3028119,
            "datetime": "2018-12-06T00:00:00",
            "time_iso": "2018-12-06T00:00:00"
          },
          {
            "time": 1544140800,
            "value": 3035593,
            "datetime": "2018-12-07T00:00:00",
            "time_iso": "2018-12-07T00:00:00"
          },
          {
            "time": 1544227200,
            "value": 3045318,
            "datetime": "2018-12-08T00:00:00",
            "time_iso": "2018-12-08T00:00:00"
          },
          {
            "time": 1544313600,
            "value": 3053915,
            "datetime": "2018-12-09T00:00:00",
            "time_iso": "2018-12-09T00:00:00"
          },
          {
            "time": 1544400000,
            "value": 3060706,
            "datetime": "2018-12-10T00:00:00",
            "time_iso": "2018-12-10T00:00:00"
          },
          {
            "time": 1544486400,
            "value": 3068135,
            "datetime": "2018-12-11T00:00:00",
            "time_iso": "2018-12-11T00:00:00"
          },
          {
            "time": 1544572800,
            "value": 3074085,
            "datetime": "2018-12-12T00:00:00",
            "time_iso": "2018-12-12T00:00:00"
          },
          {
            "time": 1544659200,
            "value": 3079421,
            "datetime": "2018-12-13T00:00:00",
            "time_iso": "2018-12-13T00:00:00"
          },
          {
            "time": 1544745600,
            "value": 3075482,
            "datetime": "2018-12-14T00:00:00",
            "time_iso": "2018-12-14T00:00:00"
          },
          {
            "time": 1544832000,
            "value": 3080116,
            "datetime": "2018-12-15T00:00:00",
            "time_iso": "2018-12-15T00:00:00"
          },
          {
            "time": 1544918400,
            "value": 3084483,
            "datetime": "2018-12-16T00:00:00",
            "time_iso": "2018-12-16T00:00:00"
          },
          {
            "time": 1545004800,
            "value": 3088381,
            "datetime": "2018-12-17T00:00:00",
            "time_iso": "2018-12-17T00:00:00"
          },
          {
            "time": 1545091200,
            "value": 3092420,
            "datetime": "2018-12-18T00:00:00",
            "time_iso": "2018-12-18T00:00:00"
          },
          {
            "time": 1545177600,
            "value": 3096489,
            "datetime": "2018-12-19T00:00:00",
            "time_iso": "2018-12-19T00:00:00"
          },
          {
            "time": 1545264000,
            "value": 3100518,
            "datetime": "2018-12-20T00:00:00",
            "time_iso": "2018-12-20T00:00:00"
          },
          {
            "time": 1545350400,
            "value": 3102037,
            "datetime": "2018-12-21T00:00:00",
            "time_iso": "2018-12-21T00:00:00"
          },
          {
            "time": 1545436800,
            "value": 3106885,
            "datetime": "2018-12-22T00:00:00",
            "time_iso": "2018-12-22T00:00:00"
          },
          {
            "time": 1545523200,
            "value": 3111430,
            "datetime": "2018-12-23T00:00:00",
            "time_iso": "2018-12-23T00:00:00"
          },
          {
            "time": 1545609600,
            "value": 3115811,
            "datetime": "2018-12-24T00:00:00",
            "time_iso": "2018-12-24T00:00:00"
          },
          {
            "time": 1545696000,
            "value": 3119652,
            "datetime": "2018-12-25T00:00:00",
            "time_iso": "2018-12-25T00:00:00"
          },
          {
            "time": 1545782400,
            "value": 3123443,
            "datetime": "2018-12-26T00:00:00",
            "time_iso": "2018-12-26T00:00:00"
          },
          {
            "time": 1545868800,
            "value": 3126411,
            "datetime": "2018-12-27T00:00:00",
            "time_iso": "2018-12-27T00:00:00"
          },
          {
            "time": 1545955200,
            "value": 3129553,
            "datetime": "2018-12-28T00:00:00",
            "time_iso": "2018-12-28T00:00:00"
          },
          {
            "time": 1546041600,
            "value": 3133422,
            "datetime": "2018-12-29T00:00:00",
            "time_iso": "2018-12-29T00:00:00"
          },
          {
            "time": 1546128000,
            "value": 3136803,
            "datetime": "2018-12-30T00:00:00",
            "time_iso": "2018-12-30T00:00:00"
          },
          {
            "time": 1546214400,
            "value": 3141174,
            "datetime": "2018-12-31T00:00:00",
            "time_iso": "2018-12-31T00:00:00"
          },
          {
            "time": 1546300800,
            "value": 3148631,
            "datetime": "2019-01-01T00:00:00",
            "time_iso": "2019-01-01T00:00:00"
          },
          {
            "time": 1546387200,
            "value": 3152926,
            "datetime": "2019-01-02T00:00:00",
            "time_iso": "2019-01-02T00:00:00"
          },
          {
            "time": 1546473600,
            "value": 3157467,
            "datetime": "2019-01-03T00:00:00",
            "time_iso": "2019-01-03T00:00:00"
          },
          {
            "time": 1546560000,
            "value": 3160891,
            "datetime": "2019-01-04T00:00:00",
            "time_iso": "2019-01-04T00:00:00"
          },
          {
            "time": 1546646400,
            "value": 3165232,
            "datetime": "2019-01-05T00:00:00",
            "time_iso": "2019-01-05T00:00:00"
          },
          {
            "time": 1546732800,
            "value": 3169861,
            "datetime": "2019-01-06T00:00:00",
            "time_iso": "2019-01-06T00:00:00"
          },
          {
            "time": 1546819200,
            "value": 3172880,
            "datetime": "2019-01-07T00:00:00",
            "time_iso": "2019-01-07T00:00:00"
          },
          {
            "time": 1546905600,
            "value": 3176005,
            "datetime": "2019-01-08T00:00:00",
            "time_iso": "2019-01-08T00:00:00"
          },
          {
            "time": 1546992000,
            "value": 3179615,
            "datetime": "2019-01-09T00:00:00",
            "time_iso": "2019-01-09T00:00:00"
          },
          {
            "time": 1547078400,
            "value": 3182506,
            "datetime": "2019-01-10T00:00:00",
            "time_iso": "2019-01-10T00:00:00"
          },
          {
            "time": 1547164800,
            "value": 3185590,
            "datetime": "2019-01-11T00:00:00",
            "time_iso": "2019-01-11T00:00:00"
          },
          {
            "time": 1547251200,
            "value": 3189300,
            "datetime": "2019-01-12T00:00:00",
            "time_iso": "2019-01-12T00:00:00"
          },
          {
            "time": 1547337600,
            "value": 3192648,
            "datetime": "2019-01-13T00:00:00",
            "time_iso": "2019-01-13T00:00:00"
          },
          {
            "time": 1547424000,
            "value": 3195645,
            "datetime": "2019-01-14T00:00:00",
            "time_iso": "2019-01-14T00:00:00"
          },
          {
            "time": 1547510400,
            "value": 3198426,
            "datetime": "2019-01-15T00:00:00",
            "time_iso": "2019-01-15T00:00:00"
          },
          {
            "time": 1547596800,
            "value": 3201493,
            "datetime": "2019-01-16T00:00:00",
            "time_iso": "2019-01-16T00:00:00"
          },
          {
            "time": 1547683200,
            "value": 3204385,
            "datetime": "2019-01-17T00:00:00",
            "time_iso": "2019-01-17T00:00:00"
          },
          {
            "time": 1547769600,
            "value": 3207118,
            "datetime": "2019-01-18T00:00:00",
            "time_iso": "2019-01-18T00:00:00"
          },
          {
            "time": 1547856000,
            "value": 3210687,
            "datetime": "2019-01-19T00:00:00",
            "time_iso": "2019-01-19T00:00:00"
          },
          {
            "time": 1547942400,
            "value": 3217018,
            "datetime": "2019-01-20T00:00:00",
            "time_iso": "2019-01-20T00:00:00"
          },
          {
            "time": 1548028800,
            "value": 3224571,
            "datetime": "2019-01-21T00:00:00",
            "time_iso": "2019-01-21T00:00:00"
          },
          {
            "time": 1548115200,
            "value": 3228335,
            "datetime": "2019-01-22T00:00:00",
            "time_iso": "2019-01-22T00:00:00"
          },
          {
            "time": 1548201600,
            "value": 3232123,
            "datetime": "2019-01-23T00:00:00",
            "time_iso": "2019-01-23T00:00:00"
          },
          {
            "time": 1548288000,
            "value": 3235453,
            "datetime": "2019-01-24T00:00:00",
            "time_iso": "2019-01-24T00:00:00"
          },
          {
            "time": 1548374400,
            "value": 3238360,
            "datetime": "2019-01-25T00:00:00",
            "time_iso": "2019-01-25T00:00:00"
          },
          {
            "time": 1548460800,
            "value": 3241341,
            "datetime": "2019-01-26T00:00:00",
            "time_iso": "2019-01-26T00:00:00"
          },
          {
            "time": 1548547200,
            "value": 3244324,
            "datetime": "2019-01-27T00:00:00",
            "time_iso": "2019-01-27T00:00:00"
          },
          {
            "time": 1548633600,
            "value": 3246756,
            "datetime": "2019-01-28T00:00:00",
            "time_iso": "2019-01-28T00:00:00"
          },
          {
            "time": 1548720000,
            "value": 3249473,
            "datetime": "2019-01-29T00:00:00",
            "time_iso": "2019-01-29T00:00:00"
          },
          {
            "time": 1548806400,
            "value": 3252090,
            "datetime": "2019-01-30T00:00:00",
            "time_iso": "2019-01-30T00:00:00"
          },
          {
            "time": 1548892800,
            "value": 3255053,
            "datetime": "2019-01-31T00:00:00",
            "time_iso": "2019-01-31T00:00:00"
          },
          {
            "time": 1548979200,
            "value": 3257797,
            "datetime": "2019-02-01T00:00:00",
            "time_iso": "2019-02-01T00:00:00"
          },
          {
            "time": 1549065600,
            "value": 3260426,
            "datetime": "2019-02-02T00:00:00",
            "time_iso": "2019-02-02T00:00:00"
          },
          {
            "time": 1549152000,
            "value": 3263248,
            "datetime": "2019-02-03T00:00:00",
            "time_iso": "2019-02-03T00:00:00"
          },
          {
            "time": 1549238400,
            "value": 3265755,
            "datetime": "2019-02-04T00:00:00",
            "time_iso": "2019-02-04T00:00:00"
          },
          {
            "time": 1549324800,
            "value": 3268240,
            "datetime": "2019-02-05T00:00:00",
            "time_iso": "2019-02-05T00:00:00"
          },
          {
            "time": 1549411200,
            "value": 3270966,
            "datetime": "2019-02-06T00:00:00",
            "time_iso": "2019-02-06T00:00:00"
          },
          {
            "time": 1549497600,
            "value": 3273907,
            "datetime": "2019-02-07T00:00:00",
            "time_iso": "2019-02-07T00:00:00"
          },
          {
            "time": 1549584000,
            "value": 3276832,
            "datetime": "2019-02-08T00:00:00",
            "time_iso": "2019-02-08T00:00:00"
          },
          {
            "time": 1549670400,
            "value": 3280038,
            "datetime": "2019-02-09T00:00:00",
            "time_iso": "2019-02-09T00:00:00"
          },
          {
            "time": 1549756800,
            "value": 3283369,
            "datetime": "2019-02-10T00:00:00",
            "time_iso": "2019-02-10T00:00:00"
          },
          {
            "time": 1549843200,
            "value": 3285937,
            "datetime": "2019-02-11T00:00:00",
            "time_iso": "2019-02-11T00:00:00"
          },
          {
            "time": 1549929600,
            "value": 3288357,
            "datetime": "2019-02-12T00:00:00",
            "time_iso": "2019-02-12T00:00:00"
          },
          {
            "time": 1550016000,
            "value": 3291658,
            "datetime": "2019-02-13T00:00:00",
            "time_iso": "2019-02-13T00:00:00"
          },
          {
            "time": 1550102400,
            "value": 3295504,
            "datetime": "2019-02-14T00:00:00",
            "time_iso": "2019-02-14T00:00:00"
          },
          {
            "time": 1550188800,
            "value": 3299423,
            "datetime": "2019-02-15T00:00:00",
            "time_iso": "2019-02-15T00:00:00"
          },
          {
            "time": 1550275200,
            "value": 3303610,
            "datetime": "2019-02-16T00:00:00",
            "time_iso": "2019-02-16T00:00:00"
          },
          {
            "time": 1550361600,
            "value": 3307932,
            "datetime": "2019-02-17T00:00:00",
            "time_iso": "2019-02-17T00:00:00"
          },
          {
            "time": 1550448000,
            "value": 3310936,
            "datetime": "2019-02-18T00:00:00",
            "time_iso": "2019-02-18T00:00:00"
          },
          {
            "time": 1550534400,
            "value": 3313945,
            "datetime": "2019-02-19T00:00:00",
            "time_iso": "2019-02-19T00:00:00"
          },
          {
            "time": 1550620800,
            "value": 3317098,
            "datetime": "2019-02-20T00:00:00",
            "time_iso": "2019-02-20T00:00:00"
          },
          {
            "time": 1550707200,
            "value": 3319883,
            "datetime": "2019-02-21T00:00:00",
            "time_iso": "2019-02-21T00:00:00"
          },
          {
            "time": 1550793600,
            "value": 3321848,
            "datetime": "2019-02-22T00:00:00",
            "time_iso": "2019-02-22T00:00:00"
          },
          {
            "time": 1550880000,
            "value": 3324481,
            "datetime": "2019-02-23T00:00:00",
            "time_iso": "2019-02-23T00:00:00"
          },
          {
            "time": 1550966400,
            "value": 3327183,
            "datetime": "2019-02-24T00:00:00",
            "time_iso": "2019-02-24T00:00:00"
          },
          {
            "time": 1551052800,
            "value": 3329173,
            "datetime": "2019-02-25T00:00:00",
            "time_iso": "2019-02-25T00:00:00"
          },
          {
            "time": 1551139200,
            "value": 3331153,
            "datetime": "2019-02-26T00:00:00",
            "time_iso": "2019-02-26T00:00:00"
          },
          {
            "time": 1551225600,
            "value": 3333874,
            "datetime": "2019-02-27T00:00:00",
            "time_iso": "2019-02-27T00:00:00"
          },
          {
            "time": 1551312000,
            "value": 3338558,
            "datetime": "2019-02-28T00:00:00",
            "time_iso": "2019-02-28T00:00:00"
          },
          {
            "time": 1551398400,
            "value": 3344789,
            "datetime": "2019-03-01T00:00:00",
            "time_iso": "2019-03-01T00:00:00"
          },
          {
            "time": 1551484800,
            "value": 3359168,
            "datetime": "2019-03-02T00:00:00",
            "time_iso": "2019-03-02T00:00:00"
          },
          {
            "time": 1551571200,
            "value": 3381644,
            "datetime": "2019-03-03T00:00:00",
            "time_iso": "2019-03-03T00:00:00"
          },
          {
            "time": 1551657600,
            "value": 3389674,
            "datetime": "2019-03-04T00:00:00",
            "time_iso": "2019-03-04T00:00:00"
          },
          {
            "time": 1551744000,
            "value": 3393955,
            "datetime": "2019-03-05T00:00:00",
            "time_iso": "2019-03-05T00:00:00"
          },
          {
            "time": 1551830400,
            "value": 3396202,
            "datetime": "2019-03-06T00:00:00",
            "time_iso": "2019-03-06T00:00:00"
          },
          {
            "time": 1551916800,
            "value": 3400496,
            "datetime": "2019-03-07T00:00:00",
            "time_iso": "2019-03-07T00:00:00"
          },
          {
            "time": 1552003200,
            "value": 3410292,
            "datetime": "2019-03-08T00:00:00",
            "time_iso": "2019-03-08T00:00:00"
          },
          {
            "time": 1552089600,
            "value": 3413701,
            "datetime": "2019-03-09T00:00:00",
            "time_iso": "2019-03-09T00:00:00"
          },
          {
            "time": 1552176000,
            "value": 3416710,
            "datetime": "2019-03-10T00:00:00",
            "time_iso": "2019-03-10T00:00:00"
          },
          {
            "time": 1552262400,
            "value": 3418752,
            "datetime": "2019-03-11T00:00:00",
            "time_iso": "2019-03-11T00:00:00"
          },
          {
            "time": 1552348800,
            "value": 3421128,
            "datetime": "2019-03-12T00:00:00",
            "time_iso": "2019-03-12T00:00:00"
          },
          {
            "time": 1552435200,
            "value": 3423512,
            "datetime": "2019-03-13T00:00:00",
            "time_iso": "2019-03-13T00:00:00"
          },
          {
            "time": 1552521600,
            "value": 3427297,
            "datetime": "2019-03-14T00:00:00",
            "time_iso": "2019-03-14T00:00:00"
          },
          {
            "time": 1552608000,
            "value": 3430591,
            "datetime": "2019-03-15T00:00:00",
            "time_iso": "2019-03-15T00:00:00"
          },
          {
            "time": 1552694400,
            "value": 3433201,
            "datetime": "2019-03-16T00:00:00",
            "time_iso": "2019-03-16T00:00:00"
          },
          {
            "time": 1552780800,
            "value": 3435949,
            "datetime": "2019-03-17T00:00:00",
            "time_iso": "2019-03-17T00:00:00"
          },
          {
            "time": 1552867200,
            "value": 3439027,
            "datetime": "2019-03-18T00:00:00",
            "time_iso": "2019-03-18T00:00:00"
          },
          {
            "time": 1552953600,
            "value": 3442016,
            "datetime": "2019-03-19T00:00:00",
            "time_iso": "2019-03-19T00:00:00"
          },
          {
            "time": 1553040000,
            "value": 3444573,
            "datetime": "2019-03-20T00:00:00",
            "time_iso": "2019-03-20T00:00:00"
          },
          {
            "time": 1553126400,
            "value": 3446929,
            "datetime": "2019-03-21T00:00:00",
            "time_iso": "2019-03-21T00:00:00"
          },
          {
            "time": 1553212800,
            "value": 3451058,
            "datetime": "2019-03-22T00:00:00",
            "time_iso": "2019-03-22T00:00:00"
          },
          {
            "time": 1553299200,
            "value": 3454313,
            "datetime": "2019-03-23T00:00:00",
            "time_iso": "2019-03-23T00:00:00"
          },
          {
            "time": 1553385600,
            "value": 3457370,
            "datetime": "2019-03-24T00:00:00",
            "time_iso": "2019-03-24T00:00:00"
          },
          {
            "time": 1553472000,
            "value": 3461852,
            "datetime": "2019-03-25T00:00:00",
            "time_iso": "2019-03-25T00:00:00"
          },
          {
            "time": 1553558400,
            "value": 3469327,
            "datetime": "2019-03-26T00:00:00",
            "time_iso": "2019-03-26T00:00:00"
          },
          {
            "time": 1553644800,
            "value": 3478089,
            "datetime": "2019-03-27T00:00:00",
            "time_iso": "2019-03-27T00:00:00"
          },
          {
            "time": 1553731200,
            "value": 3487440,
            "datetime": "2019-03-28T00:00:00",
            "time_iso": "2019-03-28T00:00:00"
          },
          {
            "time": 1553817600,
            "value": 3492565,
            "datetime": "2019-03-29T00:00:00",
            "time_iso": "2019-03-29T00:00:00"
          },
          {
            "time": 1553904000,
            "value": 3495579,
            "datetime": "2019-03-30T00:00:00",
            "time_iso": "2019-03-30T00:00:00"
          },
          {
            "time": 1553990400,
            "value": 3498210,
            "datetime": "2019-03-31T00:00:00",
            "time_iso": "2019-03-31T00:00:00"
          },
          {
            "time": 1554076800,
            "value": 3500746,
            "datetime": "2019-04-01T00:00:00",
            "time_iso": "2019-04-01T00:00:00"
          },
          {
            "time": 1554163200,
            "value": 3502964,
            "datetime": "2019-04-02T00:00:00",
            "time_iso": "2019-04-02T00:00:00"
          },
          {
            "time": 1554249600,
            "value": 3505318,
            "datetime": "2019-04-03T00:00:00",
            "time_iso": "2019-04-03T00:00:00"
          },
          {
            "time": 1554336000,
            "value": 3508152,
            "datetime": "2019-04-04T00:00:00",
            "time_iso": "2019-04-04T00:00:00"
          },
          {
            "time": 1554422400,
            "value": 3510392,
            "datetime": "2019-04-05T00:00:00",
            "time_iso": "2019-04-05T00:00:00"
          },
          {
            "time": 1554508800,
            "value": 3512975,
            "datetime": "2019-04-06T00:00:00",
            "time_iso": "2019-04-06T00:00:00"
          },
          {
            "time": 1554595200,
            "value": 3515933,
            "datetime": "2019-04-07T00:00:00",
            "time_iso": "2019-04-07T00:00:00"
          },
          {
            "time": 1554681600,
            "value": 3519167,
            "datetime": "2019-04-08T00:00:00",
            "time_iso": "2019-04-08T00:00:00"
          },
          {
            "time": 1554768000,
            "value": 3522059,
            "datetime": "2019-04-09T00:00:00",
            "time_iso": "2019-04-09T00:00:00"
          },
          {
            "time": 1554854400,
            "value": 3530808,
            "datetime": "2019-04-10T00:00:00",
            "time_iso": "2019-04-10T00:00:00"
          },
          {
            "time": 1554940800,
            "value": 3539058,
            "datetime": "2019-04-11T00:00:00",
            "time_iso": "2019-04-11T00:00:00"
          },
          {
            "time": 1555027200,
            "value": 3545462,
            "datetime": "2019-04-12T00:00:00",
            "time_iso": "2019-04-12T00:00:00"
          },
          {
            "time": 1555113600,
            "value": 3552144,
            "datetime": "2019-04-13T00:00:00",
            "time_iso": "2019-04-13T00:00:00"
          },
          {
            "time": 1555200000,
            "value": 3557874,
            "datetime": "2019-04-14T00:00:00",
            "time_iso": "2019-04-14T00:00:00"
          },
          {
            "time": 1555286400,
            "value": 3562619,
            "datetime": "2019-04-15T00:00:00",
            "time_iso": "2019-04-15T00:00:00"
          },
          {
            "time": 1555372800,
            "value": 3568916,
            "datetime": "2019-04-16T00:00:00",
            "time_iso": "2019-04-16T00:00:00"
          },
          {
            "time": 1555459200,
            "value": 3578378,
            "datetime": "2019-04-17T00:00:00",
            "time_iso": "2019-04-17T00:00:00"
          },
          {
            "time": 1555545600,
            "value": 3587235,
            "datetime": "2019-04-18T00:00:00",
            "time_iso": "2019-04-18T00:00:00"
          },
          {
            "time": 1555632000,
            "value": 3597735,
            "datetime": "2019-04-19T00:00:00",
            "time_iso": "2019-04-19T00:00:00"
          },
          {
            "time": 1555718400,
            "value": 3608383,
            "datetime": "2019-04-20T00:00:00",
            "time_iso": "2019-04-20T00:00:00"
          },
          {
            "time": 1555804800,
            "value": 3618369,
            "datetime": "2019-04-21T00:00:00",
            "time_iso": "2019-04-21T00:00:00"
          },
          {
            "time": 1555891200,
            "value": 3626866,
            "datetime": "2019-04-22T00:00:00",
            "time_iso": "2019-04-22T00:00:00"
          },
          {
            "time": 1555977600,
            "value": 3631668,
            "datetime": "2019-04-23T00:00:00",
            "time_iso": "2019-04-23T00:00:00"
          },
          {
            "time": 1556064000,
            "value": 3635783,
            "datetime": "2019-04-24T00:00:00",
            "time_iso": "2019-04-24T00:00:00"
          },
          {
            "time": 1556150400,
            "value": 3639190,
            "datetime": "2019-04-25T00:00:00",
            "time_iso": "2019-04-25T00:00:00"
          },
          {
            "time": 1556236800,
            "value": 3642191,
            "datetime": "2019-04-26T00:00:00",
            "time_iso": "2019-04-26T00:00:00"
          },
          {
            "time": 1556323200,
            "value": 3645825,
            "datetime": "2019-04-27T00:00:00",
            "time_iso": "2019-04-27T00:00:00"
          },
          {
            "time": 1556409600,
            "value": 3650968,
            "datetime": "2019-04-28T00:00:00",
            "time_iso": "2019-04-28T00:00:00"
          },
          {
            "time": 1556496000,
            "value": 3654913,
            "datetime": "2019-04-29T00:00:00",
            "time_iso": "2019-04-29T00:00:00"
          },
          {
            "time": 1556582400,
            "value": 3658277,
            "datetime": "2019-04-30T00:00:00",
            "time_iso": "2019-04-30T00:00:00"
          },
          {
            "time": 1556668800,
            "value": 3667460,
            "datetime": "2019-05-01T00:00:00",
            "time_iso": "2019-05-01T00:00:00"
          },
          {
            "time": 1556755200,
            "value": 3677944,
            "datetime": "2019-05-02T00:00:00",
            "time_iso": "2019-05-02T00:00:00"
          },
          {
            "time": 1556841600,
            "value": 3689617,
            "datetime": "2019-05-03T00:00:00",
            "time_iso": "2019-05-03T00:00:00"
          },
          {
            "time": 1556928000,
            "value": 3703627,
            "datetime": "2019-05-04T00:00:00",
            "time_iso": "2019-05-04T00:00:00"
          },
          {
            "time": 1557014400,
            "value": 3712763,
            "datetime": "2019-05-05T00:00:00",
            "time_iso": "2019-05-05T00:00:00"
          },
          {
            "time": 1557100800,
            "value": 3716044,
            "datetime": "2019-05-06T00:00:00",
            "time_iso": "2019-05-06T00:00:00"
          },
          {
            "time": 1557187200,
            "value": 3718399,
            "datetime": "2019-05-07T00:00:00",
            "time_iso": "2019-05-07T00:00:00"
          },
          {
            "time": 1557273600,
            "value": 3720764,
            "datetime": "2019-05-08T00:00:00",
            "time_iso": "2019-05-08T00:00:00"
          },
          {
            "time": 1557360000,
            "value": 3722915,
            "datetime": "2019-05-09T00:00:00",
            "time_iso": "2019-05-09T00:00:00"
          },
          {
            "time": 1557446400,
            "value": 3724802,
            "datetime": "2019-05-10T00:00:00",
            "time_iso": "2019-05-10T00:00:00"
          },
          {
            "time": 1557532800,
            "value": 3727085,
            "datetime": "2019-05-11T00:00:00",
            "time_iso": "2019-05-11T00:00:00"
          },
          {
            "time": 1557619200,
            "value": 3729329,
            "datetime": "2019-05-12T00:00:00",
            "time_iso": "2019-05-12T00:00:00"
          },
          {
            "time": 1557705600,
            "value": 3731268,
            "datetime": "2019-05-13T00:00:00",
            "time_iso": "2019-05-13T00:00:00"
          },
          {
            "time": 1557792000,
            "value": 3733891,
            "datetime": "2019-05-14T00:00:00",
            "time_iso": "2019-05-14T00:00:00"
          },
          {
            "time": 1557878400,
            "value": 3737822,
            "datetime": "2019-05-15T00:00:00",
            "time_iso": "2019-05-15T00:00:00"
          },
          {
            "time": 1557964800,
            "value": 3743581,
            "datetime": "2019-05-16T00:00:00",
            "time_iso": "2019-05-16T00:00:00"
          },
          {
            "time": 1558051200,
            "value": 3753535,
            "datetime": "2019-05-17T00:00:00",
            "time_iso": "2019-05-17T00:00:00"
          },
          {
            "time": 1558137600,
            "value": 3776922,
            "datetime": "2019-05-18T00:00:00",
            "time_iso": "2019-05-18T00:00:00"
          },
          {
            "time": 1558224000,
            "value": 3827482,
            "datetime": "2019-05-19T00:00:00",
            "time_iso": "2019-05-19T00:00:00"
          },
          {
            "time": 1558310400,
            "value": 3910428,
            "datetime": "2019-05-20T00:00:00",
            "time_iso": "2019-05-20T00:00:00"
          },
          {
            "time": 1558396800,
            "value": 4027309,
            "datetime": "2019-05-21T00:00:00",
            "time_iso": "2019-05-21T00:00:00"
          },
          {
            "time": 1558483200,
            "value": 4086755,
            "datetime": "2019-05-22T00:00:00",
            "time_iso": "2019-05-22T00:00:00"
          },
          {
            "time": 1558569600,
            "value": 4105120,
            "datetime": "2019-05-23T00:00:00",
            "time_iso": "2019-05-23T00:00:00"
          },
          {
            "time": 1558656000,
            "value": 4113035,
            "datetime": "2019-05-24T00:00:00",
            "time_iso": "2019-05-24T00:00:00"
          },
          {
            "time": 1558742400,
            "value": 4119805,
            "datetime": "2019-05-25T00:00:00",
            "time_iso": "2019-05-25T00:00:00"
          },
          {
            "time": 1558828800,
            "value": 4126406,
            "datetime": "2019-05-26T00:00:00",
            "time_iso": "2019-05-26T00:00:00"
          },
          {
            "time": 1558915200,
            "value": 4132995,
            "datetime": "2019-05-27T00:00:00",
            "time_iso": "2019-05-27T00:00:00"
          },
          {
            "time": 1559001600,
            "value": 4139003,
            "datetime": "2019-05-28T00:00:00",
            "time_iso": "2019-05-28T00:00:00"
          },
          {
            "time": 1559088000,
            "value": 4146051,
            "datetime": "2019-05-29T00:00:00",
            "time_iso": "2019-05-29T00:00:00"
          },
          {
            "time": 1559174400,
            "value": 4149922,
            "datetime": "2019-05-30T00:00:00",
            "time_iso": "2019-05-30T00:00:00"
          },
          {
            "time": 1559260800,
            "value": 4152740,
            "datetime": "2019-05-31T00:00:00",
            "time_iso": "2019-05-31T00:00:00"
          },
          {
            "time": 1559347200,
            "value": 4155997,
            "datetime": "2019-06-01T00:00:00",
            "time_iso": "2019-06-01T00:00:00"
          },
          {
            "time": 1559433600,
            "value": 4158971,
            "datetime": "2019-06-02T00:00:00",
            "time_iso": "2019-06-02T00:00:00"
          },
          {
            "time": 1559520000,
            "value": 4161567,
            "datetime": "2019-06-03T00:00:00",
            "time_iso": "2019-06-03T00:00:00"
          },
          {
            "time": 1559606400,
            "value": 4163990,
            "datetime": "2019-06-04T00:00:00",
            "time_iso": "2019-06-04T00:00:00"
          },
          {
            "time": 1559692800,
            "value": 4166453,
            "datetime": "2019-06-05T00:00:00",
            "time_iso": "2019-06-05T00:00:00"
          },
          {
            "time": 1559779200,
            "value": 4168703,
            "datetime": "2019-06-06T00:00:00",
            "time_iso": "2019-06-06T00:00:00"
          },
          {
            "time": 1559865600,
            "value": 4171067,
            "datetime": "2019-06-07T00:00:00",
            "time_iso": "2019-06-07T00:00:00"
          },
          {
            "time": 1559952000,
            "value": 4173837,
            "datetime": "2019-06-08T00:00:00",
            "time_iso": "2019-06-08T00:00:00"
          },
          {
            "time": 1560038400,
            "value": 4176018,
            "datetime": "2019-06-09T00:00:00",
            "time_iso": "2019-06-09T00:00:00"
          },
          {
            "time": 1560124800,
            "value": 4178673,
            "datetime": "2019-06-10T00:00:00",
            "time_iso": "2019-06-10T00:00:00"
          },
          {
            "time": 1560211200,
            "value": 4181267,
            "datetime": "2019-06-11T00:00:00",
            "time_iso": "2019-06-11T00:00:00"
          },
          {
            "time": 1560297600,
            "value": 4183466,
            "datetime": "2019-06-12T00:00:00",
            "time_iso": "2019-06-12T00:00:00"
          },
          {
            "time": 1560384000,
            "value": 4185308,
            "datetime": "2019-06-13T00:00:00",
            "time_iso": "2019-06-13T00:00:00"
          },
          {
            "time": 1560470400,
            "value": 4187404,
            "datetime": "2019-06-14T00:00:00",
            "time_iso": "2019-06-14T00:00:00"
          },
          {
            "time": 1560556800,
            "value": 4189214,
            "datetime": "2019-06-15T00:00:00",
            "time_iso": "2019-06-15T00:00:00"
          },
          {
            "time": 1560643200,
            "value": 4191380,
            "datetime": "2019-06-16T00:00:00",
            "time_iso": "2019-06-16T00:00:00"
          },
          {
            "time": 1560729600,
            "value": 4193444,
            "datetime": "2019-06-17T00:00:00",
            "time_iso": "2019-06-17T00:00:00"
          },
          {
            "time": 1560816000,
            "value": 4195382,
            "datetime": "2019-06-18T00:00:00",
            "time_iso": "2019-06-18T00:00:00"
          },
          {
            "time": 1560902400,
            "value": 4197232,
            "datetime": "2019-06-19T00:00:00",
            "time_iso": "2019-06-19T00:00:00"
          },
          {
            "time": 1560988800,
            "value": 4199283,
            "datetime": "2019-06-20T00:00:00",
            "time_iso": "2019-06-20T00:00:00"
          },
          {
            "time": 1561075200,
            "value": 4201571,
            "datetime": "2019-06-21T00:00:00",
            "time_iso": "2019-06-21T00:00:00"
          },
          {
            "time": 1561161600,
            "value": 4203731,
            "datetime": "2019-06-22T00:00:00",
            "time_iso": "2019-06-22T00:00:00"
          },
          {
            "time": 1561248000,
            "value": 4206145,
            "datetime": "2019-06-23T00:00:00",
            "time_iso": "2019-06-23T00:00:00"
          },
          {
            "time": 1561334400,
            "value": 4209803,
            "datetime": "2019-06-24T00:00:00",
            "time_iso": "2019-06-24T00:00:00"
          },
          {
            "time": 1561420800,
            "value": 4213537,
            "datetime": "2019-06-25T00:00:00",
            "time_iso": "2019-06-25T00:00:00"
          },
          {
            "time": 1561507200,
            "value": 4215756,
            "datetime": "2019-06-26T00:00:00",
            "time_iso": "2019-06-26T00:00:00"
          },
          {
            "time": 1561593600,
            "value": 4218042,
            "datetime": "2019-06-27T00:00:00",
            "time_iso": "2019-06-27T00:00:00"
          },
          {
            "time": 1561680000,
            "value": 4220423,
            "datetime": "2019-06-28T00:00:00",
            "time_iso": "2019-06-28T00:00:00"
          },
          {
            "time": 1561766400,
            "value": 4223074,
            "datetime": "2019-06-29T00:00:00",
            "time_iso": "2019-06-29T00:00:00"
          },
          {
            "time": 1561852800,
            "value": 4225546,
            "datetime": "2019-06-30T00:00:00",
            "time_iso": "2019-06-30T00:00:00"
          },
          {
            "time": 1561939200,
            "value": 4228953,
            "datetime": "2019-07-01T00:00:00",
            "time_iso": "2019-07-01T00:00:00"
          },
          {
            "time": 1562025600,
            "value": 4238167,
            "datetime": "2019-07-02T00:00:00",
            "time_iso": "2019-07-02T00:00:00"
          },
          {
            "time": 1562112000,
            "value": 4242260,
            "datetime": "2019-07-03T00:00:00",
            "time_iso": "2019-07-03T00:00:00"
          },
          {
            "time": 1562198400,
            "value": 4245092,
            "datetime": "2019-07-04T00:00:00",
            "time_iso": "2019-07-04T00:00:00"
          },
          {
            "time": 1562284800,
            "value": 4247783,
            "datetime": "2019-07-05T00:00:00",
            "time_iso": "2019-07-05T00:00:00"
          },
          {
            "time": 1562371200,
            "value": 4250432,
            "datetime": "2019-07-06T00:00:00",
            "time_iso": "2019-07-06T00:00:00"
          },
          {
            "time": 1562457600,
            "value": 4253179,
            "datetime": "2019-07-07T00:00:00",
            "time_iso": "2019-07-07T00:00:00"
          },
          {
            "time": 1562544000,
            "value": 4255851,
            "datetime": "2019-07-08T00:00:00",
            "time_iso": "2019-07-08T00:00:00"
          },
          {
            "time": 1562630400,
            "value": 4258676,
            "datetime": "2019-07-09T00:00:00",
            "time_iso": "2019-07-09T00:00:00"
          },
          {
            "time": 1562716800,
            "value": 4261721,
            "datetime": "2019-07-10T00:00:00",
            "time_iso": "2019-07-10T00:00:00"
          },
          {
            "time": 1562803200,
            "value": 4264521,
            "datetime": "2019-07-11T00:00:00",
            "time_iso": "2019-07-11T00:00:00"
          },
          {
            "time": 1562889600,
            "value": 4268052,
            "datetime": "2019-07-12T00:00:00",
            "time_iso": "2019-07-12T00:00:00"
          },
          {
            "time": 1562976000,
            "value": 4271918,
            "datetime": "2019-07-13T00:00:00",
            "time_iso": "2019-07-13T00:00:00"
          },
          {
            "time": 1563062400,
            "value": 4276493,
            "datetime": "2019-07-14T00:00:00",
            "time_iso": "2019-07-14T00:00:00"
          },
          {
            "time": 1563148800,
            "value": 4280856,
            "datetime": "2019-07-15T00:00:00",
            "time_iso": "2019-07-15T00:00:00"
          },
          {
            "time": 1563235200,
            "value": 4290417,
            "datetime": "2019-07-16T00:00:00",
            "time_iso": "2019-07-16T00:00:00"
          },
          {
            "time": 1563321600,
            "value": 4295500,
            "datetime": "2019-07-17T00:00:00",
            "time_iso": "2019-07-17T00:00:00"
          },
          {
            "time": 1563408000,
            "value": 4301876,
            "datetime": "2019-07-18T00:00:00",
            "time_iso": "2019-07-18T00:00:00"
          },
          {
            "time": 1563494400,
            "value": 4311728,
            "datetime": "2019-07-19T00:00:00",
            "time_iso": "2019-07-19T00:00:00"
          },
          {
            "time": 1563580800,
            "value": 4329152,
            "datetime": "2019-07-20T00:00:00",
            "time_iso": "2019-07-20T00:00:00"
          },
          {
            "time": 1563667200,
            "value": 4338258,
            "datetime": "2019-07-21T00:00:00",
            "time_iso": "2019-07-21T00:00:00"
          },
          {
            "time": 1563753600,
            "value": 4348379,
            "datetime": "2019-07-22T00:00:00",
            "time_iso": "2019-07-22T00:00:00"
          },
          {
            "time": 1563840000,
            "value": 4357442,
            "datetime": "2019-07-23T00:00:00",
            "time_iso": "2019-07-23T00:00:00"
          },
          {
            "time": 1563926400,
            "value": 4364847,
            "datetime": "2019-07-24T00:00:00",
            "time_iso": "2019-07-24T00:00:00"
          },
          {
            "time": 1564012800,
            "value": 4372860,
            "datetime": "2019-07-25T00:00:00",
            "time_iso": "2019-07-25T00:00:00"
          },
          {
            "time": 1564099200,
            "value": 4377682,
            "datetime": "2019-07-26T00:00:00",
            "time_iso": "2019-07-26T00:00:00"
          },
          {
            "time": 1564185600,
            "value": 4383106,
            "datetime": "2019-07-27T00:00:00",
            "time_iso": "2019-07-27T00:00:00"
          },
          {
            "time": 1564272000,
            "value": 4387543,
            "datetime": "2019-07-28T00:00:00",
            "time_iso": "2019-07-28T00:00:00"
          },
          {
            "time": 1564358400,
            "value": 4391720,
            "datetime": "2019-07-29T00:00:00",
            "time_iso": "2019-07-29T00:00:00"
          },
          {
            "time": 1564444800,
            "value": 4394454,
            "datetime": "2019-07-30T00:00:00",
            "time_iso": "2019-07-30T00:00:00"
          },
          {
            "time": 1564531200,
            "value": 4398872,
            "datetime": "2019-07-31T00:00:00",
            "time_iso": "2019-07-31T00:00:00"
          },
          {
            "time": 1564617600,
            "value": 4402126,
            "datetime": "2019-08-01T00:00:00",
            "time_iso": "2019-08-01T00:00:00"
          },
          {
            "time": 1564704000,
            "value": 4405254,
            "datetime": "2019-08-02T00:00:00",
            "time_iso": "2019-08-02T00:00:00"
          },
          {
            "time": 1564790400,
            "value": 4408436,
            "datetime": "2019-08-03T00:00:00",
            "time_iso": "2019-08-03T00:00:00"
          },
          {
            "time": 1564876800,
            "value": 4411532,
            "datetime": "2019-08-04T00:00:00",
            "time_iso": "2019-08-04T00:00:00"
          },
          {
            "time": 1564963200,
            "value": 4414062,
            "datetime": "2019-08-05T00:00:00",
            "time_iso": "2019-08-05T00:00:00"
          },
          {
            "time": 1565049600,
            "value": 4417124,
            "datetime": "2019-08-06T00:00:00",
            "time_iso": "2019-08-06T00:00:00"
          },
          {
            "time": 1565136000,
            "value": 4420359,
            "datetime": "2019-08-07T00:00:00",
            "time_iso": "2019-08-07T00:00:00"
          },
          {
            "time": 1565222400,
            "value": 4423562,
            "datetime": "2019-08-08T00:00:00",
            "time_iso": "2019-08-08T00:00:00"
          },
          {
            "time": 1565308800,
            "value": 4429054,
            "datetime": "2019-08-09T00:00:00",
            "time_iso": "2019-08-09T00:00:00"
          },
          {
            "time": 1565395200,
            "value": 4444153,
            "datetime": "2019-08-10T00:00:00",
            "time_iso": "2019-08-10T00:00:00"
          },
          {
            "time": 1565481600,
            "value": 4447940,
            "datetime": "2019-08-11T00:00:00",
            "time_iso": "2019-08-11T00:00:00"
          },
          {
            "time": 1565568000,
            "value": 4451501,
            "datetime": "2019-08-12T00:00:00",
            "time_iso": "2019-08-12T00:00:00"
          },
          {
            "time": 1565654400,
            "value": 4454377,
            "datetime": "2019-08-13T00:00:00",
            "time_iso": "2019-08-13T00:00:00"
          },
          {
            "time": 1565740800,
            "value": 4456856,
            "datetime": "2019-08-14T00:00:00",
            "time_iso": "2019-08-14T00:00:00"
          },
          {
            "time": 1565827200,
            "value": 4459486,
            "datetime": "2019-08-15T00:00:00",
            "time_iso": "2019-08-15T00:00:00"
          },
          {
            "time": 1565913600,
            "value": 4460302,
            "datetime": "2019-08-16T00:00:00",
            "time_iso": "2019-08-16T00:00:00"
          },
          {
            "time": 1566000000,
            "value": 4461789,
            "datetime": "2019-08-17T00:00:00",
            "time_iso": "2019-08-17T00:00:00"
          },
          {
            "time": 1566172800,
            "value": 4466968,
            "datetime": "2019-08-19T00:00:00",
            "time_iso": "2019-08-19T00:00:00"
          },
          {
            "time": 1566345600,
            "value": 4472607,
            "datetime": "2019-08-21T00:00:00",
            "time_iso": "2019-08-21T00:00:00"
          },
          {
            "time": 1566518400,
            "value": 4478735,
            "datetime": "2019-08-23T00:00:00",
            "time_iso": "2019-08-23T00:00:00"
          },
          {
            "time": 1566691200,
            "value": 4484192,
            "datetime": "2019-08-25T00:00:00",
            "time_iso": "2019-08-25T00:00:00"
          },
          {
            "time": 1566864000,
            "value": 4489076,
            "datetime": "2019-08-27T00:00:00",
            "time_iso": "2019-08-27T00:00:00"
          },
          {
            "time": 1567036800,
            "value": 4495082,
            "datetime": "2019-08-29T00:00:00",
            "time_iso": "2019-08-29T00:00:00"
          },
          {
            "time": 1567209600,
            "value": 4500350,
            "datetime": "2019-08-31T00:00:00",
            "time_iso": "2019-08-31T00:00:00"
          },
          {
            "time": 1567382400,
            "value": 4506926,
            "datetime": "2019-09-02T00:00:00",
            "time_iso": "2019-09-02T00:00:00"
          },
          {
            "time": 1567555200,
            "value": 4513206,
            "datetime": "2019-09-04T00:00:00",
            "time_iso": "2019-09-04T00:00:00"
          },
          {
            "time": 1567728000,
            "value": 4518404,
            "datetime": "2019-09-06T00:00:00",
            "time_iso": "2019-09-06T00:00:00"
          },
          {
            "time": 1567900800,
            "value": 4530270,
            "datetime": "2019-09-08T00:00:00",
            "time_iso": "2019-09-08T00:00:00"
          },
          {
            "time": 1568073600,
            "value": 4551780,
            "datetime": "2019-09-10T00:00:00",
            "time_iso": "2019-09-10T00:00:00"
          },
          {
            "time": 1568246400,
            "value": 4567387,
            "datetime": "2019-09-12T00:00:00",
            "time_iso": "2019-09-12T00:00:00"
          },
          {
            "time": 1569283200,
            "value": 4620729,
            "datetime": "2019-09-24T00:00:00",
            "time_iso": "2019-09-24T00:00:00"
          },
          {
            "time": 1569456000,
            "value": 4629481,
            "datetime": "2019-09-26T00:00:00",
            "time_iso": "2019-09-26T00:00:00"
          },
          {
            "time": 1569628800,
            "value": 4640891,
            "datetime": "2019-09-28T00:00:00",
            "time_iso": "2019-09-28T00:00:00"
          },
          {
            "time": 1569801600,
            "value": 4648610,
            "datetime": "2019-09-30T00:00:00",
            "time_iso": "2019-09-30T00:00:00"
          },
          {
            "time": 1569974400,
            "value": 4650040,
            "datetime": "2019-10-02T00:00:00",
            "time_iso": "2019-10-02T00:00:00"
          },
          {
            "time": 1570147200,
            "value": 4660853,
            "datetime": "2019-10-04T00:00:00",
            "time_iso": "2019-10-04T00:00:00"
          },
          {
            "time": 1570320000,
            "value": 4668799,
            "datetime": "2019-10-06T00:00:00",
            "time_iso": "2019-10-06T00:00:00"
          },
          {
            "time": 1570492800,
            "value": 4670998,
            "datetime": "2019-10-08T00:00:00",
            "time_iso": "2019-10-08T00:00:00"
          },
          {
            "time": 1570665600,
            "value": 4678529,
            "datetime": "2019-10-10T00:00:00",
            "time_iso": "2019-10-10T00:00:00"
          },
          {
            "time": 1570838400,
            "value": 4681499,
            "datetime": "2019-10-12T00:00:00",
            "time_iso": "2019-10-12T00:00:00"
          },
          {
            "time": 1571011200,
            "value": 4685055,
            "datetime": "2019-10-14T00:00:00",
            "time_iso": "2019-10-14T00:00:00"
          },
          {
            "time": 1571184000,
            "value": 4688259,
            "datetime": "2019-10-16T00:00:00",
            "time_iso": "2019-10-16T00:00:00"
          },
          {
            "time": 1571356800,
            "value": 4690248,
            "datetime": "2019-10-18T00:00:00",
            "time_iso": "2019-10-18T00:00:00"
          },
          {
            "time": 1571443200,
            "value": 4710688,
            "datetime": "2019-10-19T00:00:00",
            "time_iso": "2019-10-19T00:00:00"
          },
          {
            "time": 1571616000,
            "value": 4718022,
            "datetime": "2019-10-21T00:00:00",
            "time_iso": "2019-10-21T00:00:00"
          },
          {
            "time": 1571788800,
            "value": 4721351,
            "datetime": "2019-10-23T00:00:00",
            "time_iso": "2019-10-23T00:00:00"
          },
          {
            "time": 1571961600,
            "value": 4728384,
            "datetime": "2019-10-25T00:00:00",
            "time_iso": "2019-10-25T00:00:00"
          },
          {
            "time": 1572134400,
            "value": 4731622,
            "datetime": "2019-10-27T00:00:00",
            "time_iso": "2019-10-27T00:00:00"
          },
          {
            "time": 1572307200,
            "value": 4734152,
            "datetime": "2019-10-29T00:00:00",
            "time_iso": "2019-10-29T00:00:00"
          },
          {
            "time": 1572480000,
            "value": 4736374,
            "datetime": "2019-10-31T00:00:00",
            "time_iso": "2019-10-31T00:00:00"
          },
          {
            "time": 1572652800,
            "value": 4738564,
            "datetime": "2019-11-02T00:00:00",
            "time_iso": "2019-11-02T00:00:00"
          },
          {
            "time": 1572825600,
            "value": 4740795,
            "datetime": "2019-11-04T00:00:00",
            "time_iso": "2019-11-04T00:00:00"
          },
          {
            "time": 1572912000,
            "value": 4743175,
            "datetime": "2019-11-05T00:00:00",
            "time_iso": "2019-11-05T00:00:00"
          },
          {
            "time": 1573084800,
            "value": 4748686,
            "datetime": "2019-11-07T00:00:00",
            "time_iso": "2019-11-07T00:00:00"
          },
          {
            "time": 1573257600,
            "value": 4750955,
            "datetime": "2019-11-09T00:00:00",
            "time_iso": "2019-11-09T00:00:00"
          },
          {
            "time": 1573430400,
            "value": 4758873,
            "datetime": "2019-11-11T00:00:00",
            "time_iso": "2019-11-11T00:00:00"
          },
          {
            "time": 1573603200,
            "value": 4760934,
            "datetime": "2019-11-13T00:00:00",
            "time_iso": "2019-11-13T00:00:00"
          },
          {
            "time": 1573776000,
            "value": 4769133,
            "datetime": "2019-11-15T00:00:00",
            "time_iso": "2019-11-15T00:00:00"
          },
          {
            "time": 1573948800,
            "value": 4770575,
            "datetime": "2019-11-17T00:00:00",
            "time_iso": "2019-11-17T00:00:00"
          },
          {
            "time": 1574121600,
            "value": 4779040,
            "datetime": "2019-11-19T00:00:00",
            "time_iso": "2019-11-19T00:00:00"
          },
          {
            "time": 1574294400,
            "value": 4780309,
            "datetime": "2019-11-21T00:00:00",
            "time_iso": "2019-11-21T00:00:00"
          },
          {
            "time": 1574467200,
            "value": 4785012,
            "datetime": "2019-11-23T00:00:00",
            "time_iso": "2019-11-23T00:00:00"
          },
          {
            "time": 1574640000,
            "value": 4789374,
            "datetime": "2019-11-25T00:00:00",
            "time_iso": "2019-11-25T00:00:00"
          },
          {
            "time": 1574812800,
            "value": 4790117,
            "datetime": "2019-11-27T00:00:00",
            "time_iso": "2019-11-27T00:00:00"
          },
          {
            "time": 1574985600,
            "value": 4798827,
            "datetime": "2019-11-29T00:00:00",
            "time_iso": "2019-11-29T00:00:00"
          },
          {
            "time": 1575158400,
            "value": 4800164,
            "datetime": "2019-12-01T00:00:00",
            "time_iso": "2019-12-01T00:00:00"
          },
          {
            "time": 1575331200,
            "value": 4804897,
            "datetime": "2019-12-03T00:00:00",
            "time_iso": "2019-12-03T00:00:00"
          },
          {
            "time": 1575504000,
            "value": 4809260,
            "datetime": "2019-12-05T00:00:00",
            "time_iso": "2019-12-05T00:00:00"
          },
          {
            "time": 1575676800,
            "value": 4810019,
            "datetime": "2019-12-07T00:00:00",
            "time_iso": "2019-12-07T00:00:00"
          },
          {
            "time": 1575849600,
            "value": 4818550,
            "datetime": "2019-12-09T00:00:00",
            "time_iso": "2019-12-09T00:00:00"
          },
          {
            "time": 1576022400,
            "value": 4820410,
            "datetime": "2019-12-11T00:00:00",
            "time_iso": "2019-12-11T00:00:00"
          },
          {
            "time": 1576195200,
            "value": 4828167,
            "datetime": "2019-12-13T00:00:00",
            "time_iso": "2019-12-13T00:00:00"
          },
          {
            "time": 1576368000,
            "value": 4831009,
            "datetime": "2019-12-15T00:00:00",
            "time_iso": "2019-12-15T00:00:00"
          },
          {
            "time": 1576540800,
            "value": 4835105,
            "datetime": "2019-12-17T00:00:00",
            "time_iso": "2019-12-17T00:00:00"
          },
          {
            "time": 1576713600,
            "value": 4838517,
            "datetime": "2019-12-19T00:00:00",
            "time_iso": "2019-12-19T00:00:00"
          },
          {
            "time": 1576886400,
            "value": 4839803,
            "datetime": "2019-12-21T00:00:00",
            "time_iso": "2019-12-21T00:00:00"
          },
          {
            "time": 1577059200,
            "value": 4860146,
            "datetime": "2019-12-23T00:00:00",
            "time_iso": "2019-12-23T00:00:00"
          },
          {
            "time": 1577232000,
            "value": 4880200,
            "datetime": "2019-12-25T00:00:00",
            "time_iso": "2019-12-25T00:00:00"
          },
          {
            "time": 1577404800,
            "value": 4919288,
            "datetime": "2019-12-27T00:00:00",
            "time_iso": "2019-12-27T00:00:00"
          },
          {
            "time": 1577577600,
            "value": 4930628,
            "datetime": "2019-12-29T00:00:00",
            "time_iso": "2019-12-29T00:00:00"
          },
          {
            "time": 1577750400,
            "value": 4940081,
            "datetime": "2019-12-31T00:00:00",
            "time_iso": "2019-12-31T00:00:00"
          },
          {
            "time": 1577923200,
            "value": 4970401,
            "datetime": "2020-01-02T00:00:00",
            "time_iso": "2020-01-02T00:00:00"
          },
          {
            "time": 1578096000,
            "value": 4979638,
            "datetime": "2020-01-04T00:00:00",
            "time_iso": "2020-01-04T00:00:00"
          },
          {
            "time": 1578268800,
            "value": 4989493,
            "datetime": "2020-01-06T00:00:00",
            "time_iso": "2020-01-06T00:00:00"
          },
          {
            "time": 1578441600,
            "value": 5000944,
            "datetime": "2020-01-08T00:00:00",
            "time_iso": "2020-01-08T00:00:00"
          },
          {
            "time": 1578614400,
            "value": 5009889,
            "datetime": "2020-01-10T00:00:00",
            "time_iso": "2020-01-10T00:00:00"
          },
          {
            "time": 1578787200,
            "value": 5020186,
            "datetime": "2020-01-12T00:00:00",
            "time_iso": "2020-01-12T00:00:00"
          },
          {
            "time": 1578873600,
            "value": 5028087,
            "datetime": "2020-01-13T00:00:00",
            "time_iso": "2020-01-13T00:00:00"
          },
          {
            "time": 1579046400,
            "value": 5031188,
            "datetime": "2020-01-15T00:00:00",
            "time_iso": "2020-01-15T00:00:00"
          },
          {
            "time": 1579219200,
            "value": 5038387,
            "datetime": "2020-01-17T00:00:00",
            "time_iso": "2020-01-17T00:00:00"
          },
          {
            "time": 1579392000,
            "value": 5040434,
            "datetime": "2020-01-19T00:00:00",
            "time_iso": "2020-01-19T00:00:00"
          },
          {
            "time": 1579564800,
            "value": 5051048,
            "datetime": "2020-01-21T00:00:00",
            "time_iso": "2020-01-21T00:00:00"
          },
          {
            "time": 1579737600,
            "value": 5059229,
            "datetime": "2020-01-23T00:00:00",
            "time_iso": "2020-01-23T00:00:00"
          },
          {
            "time": 1579910400,
            "value": 5061038,
            "datetime": "2020-01-25T00:00:00",
            "time_iso": "2020-01-25T00:00:00"
          },
          {
            "time": 1580083200,
            "value": 5068954,
            "datetime": "2020-01-27T00:00:00",
            "time_iso": "2020-01-27T00:00:00"
          },
          {
            "time": 1580256000,
            "value": 5070360,
            "datetime": "2020-01-29T00:00:00",
            "time_iso": "2020-01-29T00:00:00"
          },
          {
            "time": 1580515200,
            "value": 5081323,
            "datetime": "2020-02-01T00:00:00",
            "time_iso": "2020-02-01T00:00:00"
          },
          {
            "time": 1580601600,
            "value": 5083306,
            "datetime": "2020-02-02T00:00:00",
            "time_iso": "2020-02-02T00:00:00"
          },
          {
            "time": 1580774400,
            "value": 5086330,
            "datetime": "2020-02-04T00:00:00",
            "time_iso": "2020-02-04T00:00:00"
          },
          {
            "time": 1580947200,
            "value": 5088757,
            "datetime": "2020-02-06T00:00:00",
            "time_iso": "2020-02-06T00:00:00"
          },
          {
            "time": 1581120000,
            "value": 5090845,
            "datetime": "2020-02-08T00:00:00",
            "time_iso": "2020-02-08T00:00:00"
          },
          {
            "time": 1581292800,
            "value": 5099667,
            "datetime": "2020-02-10T00:00:00",
            "time_iso": "2020-02-10T00:00:00"
          },
          {
            "time": 1581465600,
            "value": 5110251,
            "datetime": "2020-02-12T00:00:00",
            "time_iso": "2020-02-12T00:00:00"
          },
          {
            "time": 1581638400,
            "value": 5118114,
            "datetime": "2020-02-14T00:00:00",
            "time_iso": "2020-02-14T00:00:00"
          },
          {
            "time": 1581811200,
            "value": 5119899,
            "datetime": "2020-02-16T00:00:00",
            "time_iso": "2020-02-16T00:00:00"
          },
          {
            "time": 1582070400,
            "value": 5130733,
            "datetime": "2020-02-19T00:00:00",
            "time_iso": "2020-02-19T00:00:00"
          },
          {
            "time": 1582243200,
            "value": 5140983,
            "datetime": "2020-02-21T00:00:00",
            "time_iso": "2020-02-21T00:00:00"
          },
          {
            "time": 1582416000,
            "value": 5149505,
            "datetime": "2020-02-23T00:00:00",
            "time_iso": "2020-02-23T00:00:00"
          },
          {
            "time": 1582588800,
            "value": 5150814,
            "datetime": "2020-02-25T00:00:00",
            "time_iso": "2020-02-25T00:00:00"
          },
          {
            "time": 1582761600,
            "value": 5159111,
            "datetime": "2020-02-27T00:00:00",
            "time_iso": "2020-02-27T00:00:00"
          },
          {
            "time": 1582934400,
            "value": 5161039,
            "datetime": "2020-02-29T00:00:00",
            "time_iso": "2020-02-29T00:00:00"
          },
          {
            "time": 1583107200,
            "value": 5169012,
            "datetime": "2020-03-02T00:00:00",
            "time_iso": "2020-03-02T00:00:00"
          },
          {
            "time": 1583280000,
            "value": 5171266,
            "datetime": "2020-03-04T00:00:00",
            "time_iso": "2020-03-04T00:00:00"
          },
          {
            "time": 1583452800,
            "value": 5179298,
            "datetime": "2020-03-06T00:00:00",
            "time_iso": "2020-03-06T00:00:00"
          },
          {
            "time": 1583625600,
            "value": 5180091,
            "datetime": "2020-03-08T00:00:00",
            "time_iso": "2020-03-08T00:00:00"
          },
          {
            "time": 1583798400,
            "value": 5189195,
            "datetime": "2020-03-10T00:00:00",
            "time_iso": "2020-03-10T00:00:00"
          },
          {
            "time": 1583971200,
            "value": 5201534,
            "datetime": "2020-03-12T00:00:00",
            "time_iso": "2020-03-12T00:00:00"
          },
          {
            "time": 1584144000,
            "value": 5208452,
            "datetime": "2020-03-14T00:00:00",
            "time_iso": "2020-03-14T00:00:00"
          },
          {
            "time": 1584316800,
            "value": 5219082,
            "datetime": "2020-03-16T00:00:00",
            "time_iso": "2020-03-16T00:00:00"
          },
          {
            "time": 1584489600,
            "value": 5230104,
            "datetime": "2020-03-18T00:00:00",
            "time_iso": "2020-03-18T00:00:00"
          },
          {
            "time": 1584662400,
            "value": 5240507,
            "datetime": "2020-03-20T00:00:00",
            "time_iso": "2020-03-20T00:00:00"
          },
          {
            "time": 1584835200,
            "value": 5259997,
            "datetime": "2020-03-22T00:00:00",
            "time_iso": "2020-03-22T00:00:00"
          },
          {
            "time": 1585008000,
            "value": 5269900,
            "datetime": "2020-03-24T00:00:00",
            "time_iso": "2020-03-24T00:00:00"
          },
          {
            "time": 1585180800,
            "value": 5280584,
            "datetime": "2020-03-26T00:00:00",
            "time_iso": "2020-03-26T00:00:00"
          },
          {
            "time": 1585353600,
            "value": 5300378,
            "datetime": "2020-03-28T00:00:00",
            "time_iso": "2020-03-28T00:00:00"
          },
          {
            "time": 1585526400,
            "value": 5311710,
            "datetime": "2020-03-30T00:00:00",
            "time_iso": "2020-03-30T00:00:00"
          },
          {
            "time": 1585699200,
            "value": 5319912,
            "datetime": "2020-04-01T00:00:00",
            "time_iso": "2020-04-01T00:00:00"
          },
          {
            "time": 1585872000,
            "value": 5329959,
            "datetime": "2020-04-03T00:00:00",
            "time_iso": "2020-04-03T00:00:00"
          },
          {
            "time": 1586044800,
            "value": 5349682,
            "datetime": "2020-04-05T00:00:00",
            "time_iso": "2020-04-05T00:00:00"
          },
          {
            "time": 1586217600,
            "value": 5370175,
            "datetime": "2020-04-07T00:00:00",
            "time_iso": "2020-04-07T00:00:00"
          },
          {
            "time": 1586390400,
            "value": 5380271,
            "datetime": "2020-04-09T00:00:00",
            "time_iso": "2020-04-09T00:00:00"
          },
          {
            "time": 1586563200,
            "value": 5400926,
            "datetime": "2020-04-11T00:00:00",
            "time_iso": "2020-04-11T00:00:00"
          },
          {
            "time": 1586736000,
            "value": 5409773,
            "datetime": "2020-04-13T00:00:00",
            "time_iso": "2020-04-13T00:00:00"
          },
          {
            "time": 1586908800,
            "value": 5419203,
            "datetime": "2020-04-15T00:00:00",
            "time_iso": "2020-04-15T00:00:00"
          },
          {
            "time": 1587081600,
            "value": 5439476,
            "datetime": "2020-04-17T00:00:00",
            "time_iso": "2020-04-17T00:00:00"
          },
          {
            "time": 1587254400,
            "value": 5449916,
            "datetime": "2020-04-19T00:00:00",
            "time_iso": "2020-04-19T00:00:00"
          },
          {
            "time": 1587427200,
            "value": 5460066,
            "datetime": "2020-04-21T00:00:00",
            "time_iso": "2020-04-21T00:00:00"
          },
          {
            "time": 1587600000,
            "value": 5470117,
            "datetime": "2020-04-23T00:00:00",
            "time_iso": "2020-04-23T00:00:00"
          },
          {
            "time": 1587772800,
            "value": 5480335,
            "datetime": "2020-04-25T00:00:00",
            "time_iso": "2020-04-25T00:00:00"
          },
          {
            "time": 1587945600,
            "value": 5500875,
            "datetime": "2020-04-27T00:00:00",
            "time_iso": "2020-04-27T00:00:00"
          },
          {
            "time": 1588118400,
            "value": 5540032,
            "datetime": "2020-04-29T00:00:00",
            "time_iso": "2020-04-29T00:00:00"
          },
          {
            "time": 1588291200,
            "value": 5600829,
            "datetime": "2020-05-01T00:00:00",
            "time_iso": "2020-05-01T00:00:00"
          },
          {
            "time": 1588464000,
            "value": 5620697,
            "datetime": "2020-05-03T00:00:00",
            "time_iso": "2020-05-03T00:00:00"
          },
          {
            "time": 1588636800,
            "value": 5630350,
            "datetime": "2020-05-05T00:00:00",
            "time_iso": "2020-05-05T00:00:00"
          },
          {
            "time": 1588809600,
            "value": 5639312,
            "datetime": "2020-05-07T00:00:00",
            "time_iso": "2020-05-07T00:00:00"
          },
          {
            "time": 1588982400,
            "value": 5650140,
            "datetime": "2020-05-09T00:00:00",
            "time_iso": "2020-05-09T00:00:00"
          },
          {
            "time": 1589155200,
            "value": 5661105,
            "datetime": "2020-05-11T00:00:00",
            "time_iso": "2020-05-11T00:00:00"
          },
          {
            "time": 1589328000,
            "value": 5669121,
            "datetime": "2020-05-13T00:00:00",
            "time_iso": "2020-05-13T00:00:00"
          },
          {
            "time": 1589500800,
            "value": 5669978,
            "datetime": "2020-05-15T00:00:00",
            "time_iso": "2020-05-15T00:00:00"
          },
          {
            "time": 1589673600,
            "value": 5681450,
            "datetime": "2020-05-17T00:00:00",
            "time_iso": "2020-05-17T00:00:00"
          },
          {
            "time": 1589846400,
            "value": 5689265,
            "datetime": "2020-05-19T00:00:00",
            "time_iso": "2020-05-19T00:00:00"
          },
          {
            "time": 1590019200,
            "value": 5690397,
            "datetime": "2020-05-21T00:00:00",
            "time_iso": "2020-05-21T00:00:00"
          },
          {
            "time": 1590192000,
            "value": 5699130,
            "datetime": "2020-05-23T00:00:00",
            "time_iso": "2020-05-23T00:00:00"
          },
          {
            "time": 1590364800,
            "value": 5710145,
            "datetime": "2020-05-25T00:00:00",
            "time_iso": "2020-05-25T00:00:00"
          },
          {
            "time": 1590537600,
            "value": 5729224,
            "datetime": "2020-05-27T00:00:00",
            "time_iso": "2020-05-27T00:00:00"
          },
          {
            "time": 1590710400,
            "value": 6109259,
            "datetime": "2020-05-29T00:00:00",
            "time_iso": "2020-05-29T00:00:00"
          },
          {
            "time": 1591142400,
            "value": 6939195,
            "datetime": "2020-06-03T00:00:00",
            "time_iso": "2020-06-03T00:00:00"
          },
          {
            "time": 1591315200,
            "value": 6960097,
            "datetime": "2020-06-05T00:00:00",
            "time_iso": "2020-06-05T00:00:00"
          },
          {
            "time": 1591660800,
            "value": 6991173,
            "datetime": "2020-06-09T00:00:00",
            "time_iso": "2020-06-09T00:00:00"
          },
          {
            "time": 1591833600,
            "value": 6998810,
            "datetime": "2020-06-11T00:00:00",
            "time_iso": "2020-06-11T00:00:00"
          },
          {
            "time": 1592006400,
            "value": 7000575,
            "datetime": "2020-06-13T00:00:00",
            "time_iso": "2020-06-13T00:00:00"
          },
          {
            "time": 1592265600,
            "value": 7019550,
            "datetime": "2020-06-16T00:00:00",
            "time_iso": "2020-06-16T00:00:00"
          },
          {
            "time": 1592438400,
            "value": 7030992,
            "datetime": "2020-06-18T00:00:00",
            "time_iso": "2020-06-18T00:00:00"
          },
          {
            "time": 1593475200,
            "value": 7070162,
            "datetime": "2020-06-30T00:00:00",
            "time_iso": "2020-06-30T00:00:00"
          },
          {
            "time": 1593648000,
            "value": 7090179,
            "datetime": "2020-07-02T00:00:00",
            "time_iso": "2020-07-02T00:00:00"
          },
          {
            "time": 1594166400,
            "value": 7101513,
            "datetime": "2020-07-08T00:00:00",
            "time_iso": "2020-07-08T00:00:00"
          },
          {
            "time": 1594339200,
            "value": 7109409,
            "datetime": "2020-07-10T00:00:00",
            "time_iso": "2020-07-10T00:00:00"
          },
          {
            "time": 1594512000,
            "value": 7110303,
            "datetime": "2020-07-12T00:00:00",
            "time_iso": "2020-07-12T00:00:00"
          },
          {
            "time": 1595462400,
            "value": 7139370,
            "datetime": "2020-07-23T00:00:00",
            "time_iso": "2020-07-23T00:00:00"
          },
          {
            "time": 1595894400,
            "value": 7160339,
            "datetime": "2020-07-28T00:00:00",
            "time_iso": "2020-07-28T00:00:00"
          },
          {
            "time": 1596067200,
            "value": 7169651,
            "datetime": "2020-07-30T00:00:00",
            "time_iso": "2020-07-30T00:00:00"
          },
          {
            "time": 1596240000,
            "value": 7230164,
            "datetime": "2020-08-01T00:00:00",
            "time_iso": "2020-08-01T00:00:00"
          },
          {
            "time": 1596412800,
            "value": 7330854,
            "datetime": "2020-08-03T00:00:00",
            "time_iso": "2020-08-03T00:00:00"
          },
          {
            "time": 1596585600,
            "value": 7359466,
            "datetime": "2020-08-05T00:00:00",
            "time_iso": "2020-08-05T00:00:00"
          },
          {
            "time": 1596758400,
            "value": 7369878,
            "datetime": "2020-08-07T00:00:00",
            "time_iso": "2020-08-07T00:00:00"
          },
          {
            "time": 1596931200,
            "value": 7381124,
            "datetime": "2020-08-09T00:00:00",
            "time_iso": "2020-08-09T00:00:00"
          },
          {
            "time": 1597104000,
            "value": 7389054,
            "datetime": "2020-08-11T00:00:00",
            "time_iso": "2020-08-11T00:00:00"
          },
          {
            "time": 1597276800,
            "value": 7389874,
            "datetime": "2020-08-13T00:00:00",
            "time_iso": "2020-08-13T00:00:00"
          },
          {
            "time": 1597449600,
            "value": 7401440,
            "datetime": "2020-08-15T00:00:00",
            "time_iso": "2020-08-15T00:00:00"
          },
          {
            "time": 1597622400,
            "value": 7408994,
            "datetime": "2020-08-17T00:00:00",
            "time_iso": "2020-08-17T00:00:00"
          },
          {
            "time": 1597795200,
            "value": 7411676,
            "datetime": "2020-08-19T00:00:00",
            "time_iso": "2020-08-19T00:00:00"
          },
          {
            "time": 1597881600,
            "value": 7419700,
            "datetime": "2020-08-20T00:00:00",
            "time_iso": "2020-08-20T00:00:00"
          },
          {
            "time": 1597968000,
            "value": 7420404,
            "datetime": "2020-08-21T00:00:00",
            "time_iso": "2020-08-21T00:00:00"
          },
          {
            "time": 1598140800,
            "value": 7429410,
            "datetime": "2020-08-23T00:00:00",
            "time_iso": "2020-08-23T00:00:00"
          },
          {
            "time": 1599523200,
            "value": 7459571,
            "datetime": "2020-09-08T00:00:00",
            "time_iso": "2020-09-08T00:00:00"
          },
          {
            "time": 1599696000,
            "value": 7471436,
            "datetime": "2020-09-10T00:00:00",
            "time_iso": "2020-09-10T00:00:00"
          },
          {
            "time": 1599868800,
            "value": 7479038,
            "datetime": "2020-09-12T00:00:00",
            "time_iso": "2020-09-12T00:00:00"
          },
          {
            "time": 1600041600,
            "value": 7481144,
            "datetime": "2020-09-14T00:00:00",
            "time_iso": "2020-09-14T00:00:00"
          },
          {
            "time": 1600214400,
            "value": 7489117,
            "datetime": "2020-09-16T00:00:00",
            "time_iso": "2020-09-16T00:00:00"
          },
          {
            "time": 1601251200,
            "value": 7509934,
            "datetime": "2020-09-28T00:00:00",
            "time_iso": "2020-09-28T00:00:00"
          },
          {
            "time": 1601424000,
            "value": 7521849,
            "datetime": "2020-09-30T00:00:00",
            "time_iso": "2020-09-30T00:00:00"
          },
          {
            "time": 1601596800,
            "value": 7529530,
            "datetime": "2020-10-02T00:00:00",
            "time_iso": "2020-10-02T00:00:00"
          },
          {
            "time": 1601856000,
            "value": 7530900,
            "datetime": "2020-10-05T00:00:00",
            "time_iso": "2020-10-05T00:00:00"
          },
          {
            "time": 1602547200,
            "value": 7550713,
            "datetime": "2020-10-13T00:00:00",
            "time_iso": "2020-10-13T00:00:00"
          },
          {
            "time": 1602720000,
            "value": 7559694,
            "datetime": "2020-10-15T00:00:00",
            "time_iso": "2020-10-15T00:00:00"
          },
          {
            "time": 1603152000,
            "value": 7569674,
            "datetime": "2020-10-20T00:00:00",
            "time_iso": "2020-10-20T00:00:00"
          },
          {
            "time": 1604016000,
            "value": 7610295,
            "datetime": "2020-10-30T00:00:00",
            "time_iso": "2020-10-30T00:00:00"
          },
          {
            "time": 1605052800,
            "value": 7640024,
            "datetime": "2020-11-11T00:00:00",
            "time_iso": "2020-11-11T00:00:00"
          },
          {
            "time": 1605139200,
            "value": 7648087,
            "datetime": "2020-11-12T00:00:00",
            "time_iso": "2020-11-12T00:00:00"
          },
          {
            "time": 1605398400,
            "value": 7649454,
            "datetime": "2020-11-15T00:00:00",
            "time_iso": "2020-11-15T00:00:00"
          },
          {
            "time": 1605571200,
            "value": 7699635,
            "datetime": "2020-11-17T00:00:00",
            "time_iso": "2020-11-17T00:00:00"
          },
          {
            "time": 1605830400,
            "value": 7709693,
            "datetime": "2020-11-20T00:00:00",
            "time_iso": "2020-11-20T00:00:00"
          },
          {
            "time": 1606089600,
            "value": 7720631,
            "datetime": "2020-11-23T00:00:00",
            "time_iso": "2020-11-23T00:00:00"
          },
          {
            "time": 1606176000,
            "value": 7730768,
            "datetime": "2020-11-24T00:00:00",
            "time_iso": "2020-11-24T00:00:00"
          },
          {
            "time": 1606348800,
            "value": 7736895,
            "datetime": "2020-11-26T00:00:00",
            "time_iso": "2020-11-26T00:00:00"
          },
          {
            "time": 1606521600,
            "value": 7739805,
            "datetime": "2020-11-28T00:00:00",
            "time_iso": "2020-11-28T00:00:00"
          },
          {
            "time": 1606694400,
            "value": 7741215,
            "datetime": "2020-11-30T00:00:00",
            "time_iso": "2020-11-30T00:00:00"
          },
          {
            "time": 1606780800,
            "value": 7749728,
            "datetime": "2020-12-01T00:00:00",
            "time_iso": "2020-12-01T00:00:00"
          },
          {
            "time": 1606953600,
            "value": 7750160,
            "datetime": "2020-12-03T00:00:00",
            "time_iso": "2020-12-03T00:00:00"
          },
          {
            "time": 1607126400,
            "value": 7759072,
            "datetime": "2020-12-05T00:00:00",
            "time_iso": "2020-12-05T00:00:00"
          },
          {
            "time": 1607299200,
            "value": 7759256,
            "datetime": "2020-12-07T00:00:00",
            "time_iso": "2020-12-07T00:00:00"
          },
          {
            "time": 1607990400,
            "value": 7811123,
            "datetime": "2020-12-15T00:00:00",
            "time_iso": "2020-12-15T00:00:00"
          },
          {
            "time": 1608076800,
            "value": 7818762,
            "datetime": "2020-12-16T00:00:00",
            "time_iso": "2020-12-16T00:00:00"
          },
          {
            "time": 1608249600,
            "value": 7821826,
            "datetime": "2020-12-18T00:00:00",
            "time_iso": "2020-12-18T00:00:00"
          },
          {
            "time": 1608422400,
            "value": 7829276,
            "datetime": "2020-12-20T00:00:00",
            "time_iso": "2020-12-20T00:00:00"
          },
          {
            "time": 1608595200,
            "value": 7850715,
            "datetime": "2020-12-22T00:00:00",
            "time_iso": "2020-12-22T00:00:00"
          },
          {
            "time": 1608768000,
            "value": 7871509,
            "datetime": "2020-12-24T00:00:00",
            "time_iso": "2020-12-24T00:00:00"
          },
          {
            "time": 1608940800,
            "value": 7878932,
            "datetime": "2020-12-26T00:00:00",
            "time_iso": "2020-12-26T00:00:00"
          },
          {
            "time": 1609113600,
            "value": 7881290,
            "datetime": "2020-12-28T00:00:00",
            "time_iso": "2020-12-28T00:00:00"
          },
          {
            "time": 1609286400,
            "value": 7889174,
            "datetime": "2020-12-30T00:00:00",
            "time_iso": "2020-12-30T00:00:00"
          },
          {
            "time": 1609459200,
            "value": 7889997,
            "datetime": "2021-01-01T00:00:00",
            "time_iso": "2021-01-01T00:00:00"
          },
          {
            "time": 1609632000,
            "value": 7900304,
            "datetime": "2021-01-03T00:00:00",
            "time_iso": "2021-01-03T00:00:00"
          },
          {
            "time": 1609804800,
            "value": 7909906,
            "datetime": "2021-01-05T00:00:00",
            "time_iso": "2021-01-05T00:00:00"
          },
          {
            "time": 1609977600,
            "value": 7919305,
            "datetime": "2021-01-07T00:00:00",
            "time_iso": "2021-01-07T00:00:00"
          },
          {
            "time": 1610150400,
            "value": 7931743,
            "datetime": "2021-01-09T00:00:00",
            "time_iso": "2021-01-09T00:00:00"
          },
          {
            "time": 1610323200,
            "value": 7938721,
            "datetime": "2021-01-11T00:00:00",
            "time_iso": "2021-01-11T00:00:00"
          },
          {
            "time": 1610496000,
            "value": 7940997,
            "datetime": "2021-01-13T00:00:00",
            "time_iso": "2021-01-13T00:00:00"
          },
          {
            "time": 1610928000,
            "value": 7959199,
            "datetime": "2021-01-18T00:00:00",
            "time_iso": "2021-01-18T00:00:00"
          },
          {
            "time": 1611014400,
            "value": 7971560,
            "datetime": "2021-01-19T00:00:00",
            "time_iso": "2021-01-19T00:00:00"
          },
          {
            "time": 1611100800,
            "value": 7979332,
            "datetime": "2021-01-20T00:00:00",
            "time_iso": "2021-01-20T00:00:00"
          },
          {
            "time": 1611273600,
            "value": 7989983,
            "datetime": "2021-01-22T00:00:00",
            "time_iso": "2021-01-22T00:00:00"
          },
          {
            "time": 1611446400,
            "value": 7999732,
            "datetime": "2021-01-24T00:00:00",
            "time_iso": "2021-01-24T00:00:00"
          },
          {
            "time": 1611619200,
            "value": 8010066,
            "datetime": "2021-01-26T00:00:00",
            "time_iso": "2021-01-26T00:00:00"
          },
          {
            "time": 1611792000,
            "value": 8020692,
            "datetime": "2021-01-28T00:00:00",
            "time_iso": "2021-01-28T00:00:00"
          },
          {
            "time": 1611964800,
            "value": 8030839,
            "datetime": "2021-01-30T00:00:00",
            "time_iso": "2021-01-30T00:00:00"
          },
          {
            "time": 1612137600,
            "value": 8039069,
            "datetime": "2021-02-01T00:00:00",
            "time_iso": "2021-02-01T00:00:00"
          },
          {
            "time": 1612310400,
            "value": 8040500,
            "datetime": "2021-02-03T00:00:00",
            "time_iso": "2021-02-03T00:00:00"
          },
          {
            "time": 1612483200,
            "value": 8048805,
            "datetime": "2021-02-05T00:00:00",
            "time_iso": "2021-02-05T00:00:00"
          },
          {
            "time": 1612569600,
            "value": 8050808,
            "datetime": "2021-02-06T00:00:00",
            "time_iso": "2021-02-06T00:00:00"
          },
          {
            "time": 1612742400,
            "value": 8058049,
            "datetime": "2021-02-08T00:00:00",
            "time_iso": "2021-02-08T00:00:00"
          },
          {
            "time": 1612915200,
            "value": 8060431,
            "datetime": "2021-02-10T00:00:00",
            "time_iso": "2021-02-10T00:00:00"
          },
          {
            "time": 1613347200,
            "value": 8090040,
            "datetime": "2021-02-15T00:00:00",
            "time_iso": "2021-02-15T00:00:00"
          },
          {
            "time": 1613520000,
            "value": 8150484,
            "datetime": "2021-02-17T00:00:00",
            "time_iso": "2021-02-17T00:00:00"
          },
          {
            "time": 1613692800,
            "value": 8449019,
            "datetime": "2021-02-19T00:00:00",
            "time_iso": "2021-02-19T00:00:00"
          },
          {
            "time": 1613865600,
            "value": 8550216,
            "datetime": "2021-02-21T00:00:00",
            "time_iso": "2021-02-21T00:00:00"
          },
          {
            "time": 1614038400,
            "value": 8659222,
            "datetime": "2021-02-23T00:00:00",
            "time_iso": "2021-02-23T00:00:00"
          },
          {
            "time": 1614211200,
            "value": 8760776,
            "datetime": "2021-02-25T00:00:00",
            "time_iso": "2021-02-25T00:00:00"
          },
          {
            "time": 1614384000,
            "value": 8799999,
            "datetime": "2021-02-27T00:00:00",
            "time_iso": "2021-02-27T00:00:00"
          },
          {
            "time": 1614556800,
            "value": 8829207,
            "datetime": "2021-03-01T00:00:00",
            "time_iso": "2021-03-01T00:00:00"
          },
          {
            "time": 1614729600,
            "value": 8840452,
            "datetime": "2021-03-03T00:00:00",
            "time_iso": "2021-03-03T00:00:00"
          },
          {
            "time": 1614902400,
            "value": 8850645,
            "datetime": "2021-03-05T00:00:00",
            "time_iso": "2021-03-05T00:00:00"
          },
          {
            "time": 1615075200,
            "value": 8870781,
            "datetime": "2021-03-07T00:00:00",
            "time_iso": "2021-03-07T00:00:00"
          },
          {
            "time": 1615248000,
            "value": 8880977,
            "datetime": "2021-03-09T00:00:00",
            "time_iso": "2021-03-09T00:00:00"
          },
          {
            "time": 1615420800,
            "value": 8889563,
            "datetime": "2021-03-11T00:00:00",
            "time_iso": "2021-03-11T00:00:00"
          },
          {
            "time": 1615593600,
            "value": 8889759,
            "datetime": "2021-03-13T00:00:00",
            "time_iso": "2021-03-13T00:00:00"
          },
          {
            "time": 1615766400,
            "value": 8909891,
            "datetime": "2021-03-15T00:00:00",
            "time_iso": "2021-03-15T00:00:00"
          },
          {
            "time": 1615939200,
            "value": 8920547,
            "datetime": "2021-03-17T00:00:00",
            "time_iso": "2021-03-17T00:00:00"
          },
          {
            "time": 1616112000,
            "value": 8930757,
            "datetime": "2021-03-19T00:00:00",
            "time_iso": "2021-03-19T00:00:00"
          },
          {
            "time": 1616284800,
            "value": 8939600,
            "datetime": "2021-03-21T00:00:00",
            "time_iso": "2021-03-21T00:00:00"
          },
          {
            "time": 1616457600,
            "value": 8939187,
            "datetime": "2021-03-23T00:00:00",
            "time_iso": "2021-03-23T00:00:00"
          },
          {
            "time": 1616630400,
            "value": 8950859,
            "datetime": "2021-03-25T00:00:00",
            "time_iso": "2021-03-25T00:00:00"
          },
          {
            "time": 1616803200,
            "value": 8958028,
            "datetime": "2021-03-27T00:00:00",
            "time_iso": "2021-03-27T00:00:00"
          },
          {
            "time": 1616976000,
            "value": 8961545,
            "datetime": "2021-03-29T00:00:00",
            "time_iso": "2021-03-29T00:00:00"
          },
          {
            "time": 1617148800,
            "value": 8968452,
            "datetime": "2021-03-31T00:00:00",
            "time_iso": "2021-03-31T00:00:00"
          },
          {
            "time": 1617321600,
            "value": 8971823,
            "datetime": "2021-04-02T00:00:00",
            "time_iso": "2021-04-02T00:00:00"
          },
          {
            "time": 1617494400,
            "value": 8975060,
            "datetime": "2021-04-04T00:00:00",
            "time_iso": "2021-04-04T00:00:00"
          },
          {
            "time": 1617667200,
            "value": 8978261,
            "datetime": "2021-04-06T00:00:00",
            "time_iso": "2021-04-06T00:00:00"
          },
          {
            "time": 1617840000,
            "value": 8981494,
            "datetime": "2021-04-08T00:00:00",
            "time_iso": "2021-04-08T00:00:00"
          },
          {
            "time": 1618012800,
            "value": 8984994,
            "datetime": "2021-04-10T00:00:00",
            "time_iso": "2021-04-10T00:00:00"
          },
          {
            "time": 1618185600,
            "value": 8988359,
            "datetime": "2021-04-12T00:00:00",
            "time_iso": "2021-04-12T00:00:00"
          },
          {
            "time": 1618358400,
            "value": 8991153,
            "datetime": "2021-04-14T00:00:00",
            "time_iso": "2021-04-14T00:00:00"
          },
          {
            "time": 1618531200,
            "value": 8998734,
            "datetime": "2021-04-16T00:00:00",
            "time_iso": "2021-04-16T00:00:00"
          },
          {
            "time": 1618704000,
            "value": 9000069,
            "datetime": "2021-04-18T00:00:00",
            "time_iso": "2021-04-18T00:00:00"
          },
          {
            "time": 1618876800,
            "value": 9029968,
            "datetime": "2021-04-20T00:00:00",
            "time_iso": "2021-04-20T00:00:00"
          },
          {
            "time": 1619049600,
            "value": 9040870,
            "datetime": "2021-04-22T00:00:00",
            "time_iso": "2021-04-22T00:00:00"
          },
          {
            "time": 1619222400,
            "value": 9080430,
            "datetime": "2021-04-24T00:00:00",
            "time_iso": "2021-04-24T00:00:00"
          },
          {
            "time": 1619395200,
            "value": 9090197,
            "datetime": "2021-04-26T00:00:00",
            "time_iso": "2021-04-26T00:00:00"
          },
          {
            "time": 1619568000,
            "value": 9099889,
            "datetime": "2021-04-28T00:00:00",
            "time_iso": "2021-04-28T00:00:00"
          },
          {
            "time": 1619740800,
            "value": 9109954,
            "datetime": "2021-04-30T00:00:00",
            "time_iso": "2021-04-30T00:00:00"
          },
          {
            "time": 1619913600,
            "value": 9139258,
            "datetime": "2021-05-02T00:00:00",
            "time_iso": "2021-05-02T00:00:00"
          },
          {
            "time": 1620086400,
            "value": 9151822,
            "datetime": "2021-05-04T00:00:00",
            "time_iso": "2021-05-04T00:00:00"
          },
          {
            "time": 1620259200,
            "value": 9158781,
            "datetime": "2021-05-06T00:00:00",
            "time_iso": "2021-05-06T00:00:00"
          },
          {
            "time": 1620432000,
            "value": 9160973,
            "datetime": "2021-05-08T00:00:00",
            "time_iso": "2021-05-08T00:00:00"
          },
          {
            "time": 1620604800,
            "value": 9181343,
            "datetime": "2021-05-10T00:00:00",
            "time_iso": "2021-05-10T00:00:00"
          },
          {
            "time": 1620777600,
            "value": 9188561,
            "datetime": "2021-05-12T00:00:00",
            "time_iso": "2021-05-12T00:00:00"
          },
          {
            "time": 1620864000,
            "value": 9191424,
            "datetime": "2021-05-13T00:00:00",
            "time_iso": "2021-05-13T00:00:00"
          },
          {
            "time": 1621036800,
            "value": 9199270,
            "datetime": "2021-05-15T00:00:00",
            "time_iso": "2021-05-15T00:00:00"
          },
          {
            "time": 1621209600,
            "value": 9201076,
            "datetime": "2021-05-17T00:00:00",
            "time_iso": "2021-05-17T00:00:00"
          },
          {
            "time": 1621382400,
            "value": 9205044,
            "datetime": "2021-05-19T00:00:00",
            "time_iso": "2021-05-19T00:00:00"
          },
          {
            "time": 1621555200,
            "value": 9209028,
            "datetime": "2021-05-21T00:00:00",
            "time_iso": "2021-05-21T00:00:00"
          },
          {
            "time": 1621728000,
            "value": 9210864,
            "datetime": "2021-05-23T00:00:00",
            "time_iso": "2021-05-23T00:00:00"
          },
          {
            "time": 1621900800,
            "value": 9218870,
            "datetime": "2021-05-25T00:00:00",
            "time_iso": "2021-05-25T00:00:00"
          },
          {
            "time": 1622073600,
            "value": 9219882,
            "datetime": "2021-05-27T00:00:00",
            "time_iso": "2021-05-27T00:00:00"
          },
          {
            "time": 1622678400,
            "value": 9229316,
            "datetime": "2021-06-03T00:00:00",
            "time_iso": "2021-06-03T00:00:00"
          },
          {
            "time": 1622851200,
            "value": 9240513,
            "datetime": "2021-06-05T00:00:00",
            "time_iso": "2021-06-05T00:00:00"
          },
          {
            "time": 1623542400,
            "value": 9261855,
            "datetime": "2021-06-13T00:00:00",
            "time_iso": "2021-06-13T00:00:00"
          },
          {
            "time": 1623715200,
            "value": 9269772,
            "datetime": "2021-06-15T00:00:00",
            "time_iso": "2021-06-15T00:00:00"
          },
          {
            "time": 1624233600,
            "value": 9271378,
            "datetime": "2021-06-21T00:00:00",
            "time_iso": "2021-06-21T00:00:00"
          },
          {
            "time": 1624406400,
            "value": 9273503,
            "datetime": "2021-06-23T00:00:00",
            "time_iso": "2021-06-23T00:00:00"
          },
          {
            "time": 1624579200,
            "value": 9276738,
            "datetime": "2021-06-25T00:00:00",
            "time_iso": "2021-06-25T00:00:00"
          },
          {
            "time": 1624752000,
            "value": 9279022,
            "datetime": "2021-06-27T00:00:00",
            "time_iso": "2021-06-27T00:00:00"
          },
          {
            "time": 1625097600,
            "value": 9280528,
            "datetime": "2021-07-01T00:00:00",
            "time_iso": "2021-07-01T00:00:00"
          },
          {
            "time": 1625788800,
            "value": 9288416,
            "datetime": "2021-07-09T00:00:00",
            "time_iso": "2021-07-09T00:00:00"
          },
          {
            "time": 1626134400,
            "value": 9290904,
            "datetime": "2021-07-13T00:00:00",
            "time_iso": "2021-07-13T00:00:00"
          },
          {
            "time": 1626220800,
            "value": 9292785,
            "datetime": "2021-07-14T00:00:00",
            "time_iso": "2021-07-14T00:00:00"
          },
          {
            "time": 1626307200,
            "value": 9295684,
            "datetime": "2021-07-15T00:00:00",
            "time_iso": "2021-07-15T00:00:00"
          },
          {
            "time": 1626393600,
            "value": 9298570,
            "datetime": "2021-07-16T00:00:00",
            "time_iso": "2021-07-16T00:00:00"
          },
          {
            "time": 1626480000,
            "value": 9301093,
            "datetime": "2021-07-17T00:00:00",
            "time_iso": "2021-07-17T00:00:00"
          },
          {
            "time": 1626566400,
            "value": 9303186,
            "datetime": "2021-07-18T00:00:00",
            "time_iso": "2021-07-18T00:00:00"
          },
          {
            "time": 1626652800,
            "value": 9305070,
            "datetime": "2021-07-19T00:00:00",
            "time_iso": "2021-07-19T00:00:00"
          },
          {
            "time": 1626739200,
            "value": 9306899,
            "datetime": "2021-07-20T00:00:00",
            "time_iso": "2021-07-20T00:00:00"
          },
          {
            "time": 1626825600,
            "value": 9308826,
            "datetime": "2021-07-21T00:00:00",
            "time_iso": "2021-07-21T00:00:00"
          },
          {
            "time": 1626912000,
            "value": 9310921,
            "datetime": "2021-07-22T00:00:00",
            "time_iso": "2021-07-22T00:00:00"
          },
          {
            "time": 1626998400,
            "value": 9312332,
            "datetime": "2021-07-23T00:00:00",
            "time_iso": "2021-07-23T00:00:00"
          },
          {
            "time": 1627171200,
            "value": 9314398,
            "datetime": "2021-07-25T00:00:00",
            "time_iso": "2021-07-25T00:00:00"
          },
          {
            "time": 1627516800,
            "value": 9318953,
            "datetime": "2021-07-29T00:00:00",
            "time_iso": "2021-07-29T00:00:00"
          },
          {
            "time": 1627603200,
            "value": 9321353,
            "datetime": "2021-07-30T00:00:00",
            "time_iso": "2021-07-30T00:00:00"
          },
          {
            "time": 1627689600,
            "value": 9322686,
            "datetime": "2021-07-31T00:00:00",
            "time_iso": "2021-07-31T00:00:00"
          },
          {
            "time": 1627776000,
            "value": 9323821,
            "datetime": "2021-08-01T00:00:00",
            "time_iso": "2021-08-01T00:00:00"
          },
          {
            "time": 1627862400,
            "value": 9324792,
            "datetime": "2021-08-02T00:00:00",
            "time_iso": "2021-08-02T00:00:00"
          },
          {
            "time": 1627948800,
            "value": 9325632,
            "datetime": "2021-08-03T00:00:00",
            "time_iso": "2021-08-03T00:00:00"
          },
          {
            "time": 1628035200,
            "value": 9326376,
            "datetime": "2021-08-04T00:00:00",
            "time_iso": "2021-08-04T00:00:00"
          },
          {
            "time": 1628121600,
            "value": 9327055,
            "datetime": "2021-08-05T00:00:00",
            "time_iso": "2021-08-05T00:00:00"
          },
          {
            "time": 1628208000,
            "value": 9327703,
            "datetime": "2021-08-06T00:00:00",
            "time_iso": "2021-08-06T00:00:00"
          },
          {
            "time": 1628380800,
            "value": 9329044,
            "datetime": "2021-08-08T00:00:00",
            "time_iso": "2021-08-08T00:00:00"
          },
          {
            "time": 1628553600,
            "value": 9330344,
            "datetime": "2021-08-10T00:00:00",
            "time_iso": "2021-08-10T00:00:00"
          },
          {
            "time": 1628640000,
            "value": 9331182,
            "datetime": "2021-08-11T00:00:00",
            "time_iso": "2021-08-11T00:00:00"
          },
          {
            "time": 1628726400,
            "value": 9332131,
            "datetime": "2021-08-12T00:00:00",
            "time_iso": "2021-08-12T00:00:00"
          },
          {
            "time": 1628899200,
            "value": 9334289,
            "datetime": "2021-08-14T00:00:00",
            "time_iso": "2021-08-14T00:00:00"
          },
          {
            "time": 1629072000,
            "value": 9336667,
            "datetime": "2021-08-16T00:00:00",
            "time_iso": "2021-08-16T00:00:00"
          },
          {
            "time": 1629158400,
            "value": 9337892,
            "datetime": "2021-08-17T00:00:00",
            "time_iso": "2021-08-17T00:00:00"
          },
          {
            "time": 1629244800,
            "value": 9339117,
            "datetime": "2021-08-18T00:00:00",
            "time_iso": "2021-08-18T00:00:00"
          },
          {
            "time": 1629417600,
            "value": 9341745,
            "datetime": "2021-08-20T00:00:00",
            "time_iso": "2021-08-20T00:00:00"
          },
          {
            "time": 1629590400,
            "value": 9343722,
            "datetime": "2021-08-22T00:00:00",
            "time_iso": "2021-08-22T00:00:00"
          },
          {
            "time": 1629763200,
            "value": 9345413,
            "datetime": "2021-08-24T00:00:00",
            "time_iso": "2021-08-24T00:00:00"
          },
          {
            "time": 1629936000,
            "value": 9347197,
            "datetime": "2021-08-26T00:00:00",
            "time_iso": "2021-08-26T00:00:00"
          },
          {
            "time": 1630022400,
            "value": 9348243,
            "datetime": "2021-08-27T00:00:00",
            "time_iso": "2021-08-27T00:00:00"
          },
          {
            "time": 1630195200,
            "value": 9350857,
            "datetime": "2021-08-29T00:00:00",
            "time_iso": "2021-08-29T00:00:00"
          },
          {
            "time": 1630368000,
            "value": 9358045,
            "datetime": "2021-08-31T00:00:00",
            "time_iso": "2021-08-31T00:00:00"
          },
          {
            "time": 1630540800,
            "value": 9361555,
            "datetime": "2021-09-02T00:00:00",
            "time_iso": "2021-09-02T00:00:00"
          },
          {
            "time": 1630713600,
            "value": 9364283,
            "datetime": "2021-09-04T00:00:00",
            "time_iso": "2021-09-04T00:00:00"
          },
          {
            "time": 1630886400,
            "value": 9366772,
            "datetime": "2021-09-06T00:00:00",
            "time_iso": "2021-09-06T00:00:00"
          },
          {
            "time": 1631059200,
            "value": 9368731,
            "datetime": "2021-09-08T00:00:00",
            "time_iso": "2021-09-08T00:00:00"
          },
          {
            "time": 1631232000,
            "value": 9369870,
            "datetime": "2021-09-10T00:00:00",
            "time_iso": "2021-09-10T00:00:00"
          },
          {
            "time": 1631404800,
            "value": 9370301,
            "datetime": "2021-09-12T00:00:00",
            "time_iso": "2021-09-12T00:00:00"
          },
          {
            "time": 1631577600,
            "value": 9374973,
            "datetime": "2021-09-14T00:00:00",
            "time_iso": "2021-09-14T00:00:00"
          },
          {
            "time": 1631750400,
            "value": 9379912,
            "datetime": "2021-09-16T00:00:00",
            "time_iso": "2021-09-16T00:00:00"
          },
          {
            "time": 1631923200,
            "value": 9380702,
            "datetime": "2021-09-18T00:00:00",
            "time_iso": "2021-09-18T00:00:00"
          },
          {
            "time": 1632096000,
            "value": 9382986,
            "datetime": "2021-09-20T00:00:00",
            "time_iso": "2021-09-20T00:00:00"
          },
          {
            "time": 1632441600,
            "value": 9388965,
            "datetime": "2021-09-24T00:00:00",
            "time_iso": "2021-09-24T00:00:00"
          },
          {
            "time": 1632787200,
            "value": 9391322,
            "datetime": "2021-09-28T00:00:00",
            "time_iso": "2021-09-28T00:00:00"
          },
          {
            "time": 1632960000,
            "value": 9393882,
            "datetime": "2021-09-30T00:00:00",
            "time_iso": "2021-09-30T00:00:00"
          },
          {
            "time": 1633219200,
            "value": 9398627,
            "datetime": "2021-10-03T00:00:00",
            "time_iso": "2021-10-03T00:00:00"
          },
          {
            "time": 1633392000,
            "value": 9400922,
            "datetime": "2021-10-05T00:00:00",
            "time_iso": "2021-10-05T00:00:00"
          },
          {
            "time": 1633651200,
            "value": 9404583,
            "datetime": "2021-10-08T00:00:00",
            "time_iso": "2021-10-08T00:00:00"
          },
          {
            "time": 1633824000,
            "value": 9407016,
            "datetime": "2021-10-10T00:00:00",
            "time_iso": "2021-10-10T00:00:00"
          },
          {
            "time": 1633996800,
            "value": 9409215,
            "datetime": "2021-10-12T00:00:00",
            "time_iso": "2021-10-12T00:00:00"
          },
          {
            "time": 1634169600,
            "value": 9411044,
            "datetime": "2021-10-14T00:00:00",
            "time_iso": "2021-10-14T00:00:00"
          },
          {
            "time": 1634342400,
            "value": 9413604,
            "datetime": "2021-10-16T00:00:00",
            "time_iso": "2021-10-16T00:00:00"
          },
          {
            "time": 1634515200,
            "value": 9416531,
            "datetime": "2021-10-18T00:00:00",
            "time_iso": "2021-10-18T00:00:00"
          },
          {
            "time": 1634688000,
            "value": 9418996,
            "datetime": "2021-10-20T00:00:00",
            "time_iso": "2021-10-20T00:00:00"
          },
          {
            "time": 1634860800,
            "value": 9420644,
            "datetime": "2021-10-22T00:00:00",
            "time_iso": "2021-10-22T00:00:00"
          },
          {
            "time": 1635033600,
            "value": 9422040,
            "datetime": "2021-10-24T00:00:00",
            "time_iso": "2021-10-24T00:00:00"
          },
          {
            "time": 1635206400,
            "value": 9423271,
            "datetime": "2021-10-26T00:00:00",
            "time_iso": "2021-10-26T00:00:00"
          },
          {
            "time": 1635379200,
            "value": 9424444,
            "datetime": "2021-10-28T00:00:00",
            "time_iso": "2021-10-28T00:00:00"
          },
          {
            "time": 1635552000,
            "value": 9425662,
            "datetime": "2021-10-30T00:00:00",
            "time_iso": "2021-10-30T00:00:00"
          },
          {
            "time": 1635724800,
            "value": 9427031,
            "datetime": "2021-11-01T00:00:00",
            "time_iso": "2021-11-01T00:00:00"
          },
          {
            "time": 1635897600,
            "value": 9428657,
            "datetime": "2021-11-03T00:00:00",
            "time_iso": "2021-11-03T00:00:00"
          },
          {
            "time": 1636070400,
            "value": 9430916,
            "datetime": "2021-11-05T00:00:00",
            "time_iso": "2021-11-05T00:00:00"
          },
          {
            "time": 1636243200,
            "value": 9434849,
            "datetime": "2021-11-07T00:00:00",
            "time_iso": "2021-11-07T00:00:00"
          },
          {
            "time": 1636416000,
            "value": 9438626,
            "datetime": "2021-11-09T00:00:00",
            "time_iso": "2021-11-09T00:00:00"
          },
          {
            "time": 1636588800,
            "value": 9440526,
            "datetime": "2021-11-11T00:00:00",
            "time_iso": "2021-11-11T00:00:00"
          },
          {
            "time": 1636761600,
            "value": 9448167,
            "datetime": "2021-11-13T00:00:00",
            "time_iso": "2021-11-13T00:00:00"
          },
          {
            "time": 1636934400,
            "value": 9451145,
            "datetime": "2021-11-15T00:00:00",
            "time_iso": "2021-11-15T00:00:00"
          },
          {
            "time": 1637107200,
            "value": 9454786,
            "datetime": "2021-11-17T00:00:00",
            "time_iso": "2021-11-17T00:00:00"
          },
          {
            "time": 1637280000,
            "value": 9458245,
            "datetime": "2021-11-19T00:00:00",
            "time_iso": "2021-11-19T00:00:00"
          },
          {
            "time": 1637452800,
            "value": 9460696,
            "datetime": "2021-11-21T00:00:00",
            "time_iso": "2021-11-21T00:00:00"
          },
          {
            "time": 1637625600,
            "value": 9468005,
            "datetime": "2021-11-23T00:00:00",
            "time_iso": "2021-11-23T00:00:00"
          },
          {
            "time": 1637798400,
            "value": 9471386,
            "datetime": "2021-11-25T00:00:00",
            "time_iso": "2021-11-25T00:00:00"
          },
          {
            "time": 1637971200,
            "value": 9474848,
            "datetime": "2021-11-27T00:00:00",
            "time_iso": "2021-11-27T00:00:00"
          },
          {
            "time": 1638144000,
            "value": 9478146,
            "datetime": "2021-11-29T00:00:00",
            "time_iso": "2021-11-29T00:00:00"
          },
          {
            "time": 1638316800,
            "value": 9480977,
            "datetime": "2021-12-01T00:00:00",
            "time_iso": "2021-12-01T00:00:00"
          },
          {
            "time": 1638489600,
            "value": 9488276,
            "datetime": "2021-12-03T00:00:00",
            "time_iso": "2021-12-03T00:00:00"
          },
          {
            "time": 1638662400,
            "value": 9510964,
            "datetime": "2021-12-05T00:00:00",
            "time_iso": "2021-12-05T00:00:00"
          },
          {
            "time": 1638835200,
            "value": 9519026,
            "datetime": "2021-12-07T00:00:00",
            "time_iso": "2021-12-07T00:00:00"
          },
          {
            "time": 1639008000,
            "value": 9520645,
            "datetime": "2021-12-09T00:00:00",
            "time_iso": "2021-12-09T00:00:00"
          },
          {
            "time": 1639180800,
            "value": 9528912,
            "datetime": "2021-12-11T00:00:00",
            "time_iso": "2021-12-11T00:00:00"
          },
          {
            "time": 1639353600,
            "value": 9530491,
            "datetime": "2021-12-13T00:00:00",
            "time_iso": "2021-12-13T00:00:00"
          },
          {
            "time": 1639526400,
            "value": 9535339,
            "datetime": "2021-12-15T00:00:00",
            "time_iso": "2021-12-15T00:00:00"
          },
          {
            "time": 1639699200,
            "value": 9539130,
            "datetime": "2021-12-17T00:00:00",
            "time_iso": "2021-12-17T00:00:00"
          },
          {
            "time": 1639872000,
            "value": 9539177,
            "datetime": "2021-12-19T00:00:00",
            "time_iso": "2021-12-19T00:00:00"
          },
          {
            "time": 1640217600,
            "value": 9560621,
            "datetime": "2021-12-23T00:00:00",
            "time_iso": "2021-12-23T00:00:00"
          },
          {
            "time": 1640390400,
            "value": 9619691,
            "datetime": "2021-12-25T00:00:00",
            "time_iso": "2021-12-25T00:00:00"
          },
          {
            "time": 1640563200,
            "value": 9670065,
            "datetime": "2021-12-27T00:00:00",
            "time_iso": "2021-12-27T00:00:00"
          },
          {
            "time": 1640736000,
            "value": 9689462,
            "datetime": "2021-12-29T00:00:00",
            "time_iso": "2021-12-29T00:00:00"
          },
          {
            "time": 1640908800,
            "value": 9701232,
            "datetime": "2021-12-31T00:00:00",
            "time_iso": "2021-12-31T00:00:00"
          },
          {
            "time": 1641081600,
            "value": 9708878,
            "datetime": "2022-01-02T00:00:00",
            "time_iso": "2022-01-02T00:00:00"
          },
          {
            "time": 1641254400,
            "value": 9710016,
            "datetime": "2022-01-04T00:00:00",
            "time_iso": "2022-01-04T00:00:00"
          },
          {
            "time": 1641427200,
            "value": 9729806,
            "datetime": "2022-01-06T00:00:00",
            "time_iso": "2022-01-06T00:00:00"
          },
          {
            "time": 1641600000,
            "value": 9739404,
            "datetime": "2022-01-08T00:00:00",
            "time_iso": "2022-01-08T00:00:00"
          },
          {
            "time": 1641772800,
            "value": 9750834,
            "datetime": "2022-01-10T00:00:00",
            "time_iso": "2022-01-10T00:00:00"
          },
          {
            "time": 1641945600,
            "value": 9761111,
            "datetime": "2022-01-12T00:00:00",
            "time_iso": "2022-01-12T00:00:00"
          },
          {
            "time": 1642032000,
            "value": 9769652,
            "datetime": "2022-01-13T00:00:00",
            "time_iso": "2022-01-13T00:00:00"
          },
          {
            "time": 1644019200,
            "value": 9810952,
            "datetime": "2022-02-05T00:00:00",
            "time_iso": "2022-02-05T00:00:00"
          },
          {
            "time": 1644278400,
            "value": 9819029,
            "datetime": "2022-02-08T00:00:00",
            "time_iso": "2022-02-08T00:00:00"
          },
          {
            "time": 1644451200,
            "value": 9821248,
            "datetime": "2022-02-10T00:00:00",
            "time_iso": "2022-02-10T00:00:00"
          },
          {
            "time": 1644624000,
            "value": 9823902,
            "datetime": "2022-02-12T00:00:00",
            "time_iso": "2022-02-12T00:00:00"
          },
          {
            "time": 1644796800,
            "value": 9826680,
            "datetime": "2022-02-14T00:00:00",
            "time_iso": "2022-02-14T00:00:00"
          },
          {
            "time": 1644969600,
            "value": 9828805,
            "datetime": "2022-02-16T00:00:00",
            "time_iso": "2022-02-16T00:00:00"
          },
          {
            "time": 1645228800,
            "value": 9830567,
            "datetime": "2022-02-19T00:00:00",
            "time_iso": "2022-02-19T00:00:00"
          },
          {
            "time": 1645315200,
            "value": 9832246,
            "datetime": "2022-02-20T00:00:00",
            "time_iso": "2022-02-20T00:00:00"
          },
          {
            "time": 1645401600,
            "value": 9834861,
            "datetime": "2022-02-21T00:00:00",
            "time_iso": "2022-02-21T00:00:00"
          },
          {
            "time": 1645574400,
            "value": 9839103,
            "datetime": "2022-02-23T00:00:00",
            "time_iso": "2022-02-23T00:00:00"
          },
          {
            "time": 1645747200,
            "value": 9840242,
            "datetime": "2022-02-25T00:00:00",
            "time_iso": "2022-02-25T00:00:00"
          },
          {
            "time": 1646006400,
            "value": 9842656,
            "datetime": "2022-02-28T00:00:00",
            "time_iso": "2022-02-28T00:00:00"
          },
          {
            "time": 1646265600,
            "value": 9845589,
            "datetime": "2022-03-03T00:00:00",
            "time_iso": "2022-03-03T00:00:00"
          },
          {
            "time": 1646524800,
            "value": 9848622,
            "datetime": "2022-03-06T00:00:00",
            "time_iso": "2022-03-06T00:00:00"
          },
          {
            "time": 1646784000,
            "value": 9851683,
            "datetime": "2022-03-09T00:00:00",
            "time_iso": "2022-03-09T00:00:00"
          },
          {
            "time": 1647043200,
            "value": 9855116,
            "datetime": "2022-03-12T00:00:00",
            "time_iso": "2022-03-12T00:00:00"
          },
          {
            "time": 1647302400,
            "value": 9858432,
            "datetime": "2022-03-15T00:00:00",
            "time_iso": "2022-03-15T00:00:00"
          },
          {
            "time": 1647561600,
            "value": 9859919,
            "datetime": "2022-03-18T00:00:00",
            "time_iso": "2022-03-18T00:00:00"
          },
          {
            "time": 1647734400,
            "value": 9859516,
            "datetime": "2022-03-20T00:00:00",
            "time_iso": "2022-03-20T00:00:00"
          },
          {
            "time": 1647993600,
            "value": 9870066,
            "datetime": "2022-03-23T00:00:00",
            "time_iso": "2022-03-23T00:00:00"
          },
          {
            "time": 1648252800,
            "value": 9876763,
            "datetime": "2022-03-26T00:00:00",
            "time_iso": "2022-03-26T00:00:00"
          },
          {
            "time": 1648512000,
            "value": 9879954,
            "datetime": "2022-03-29T00:00:00",
            "time_iso": "2022-03-29T00:00:00"
          },
          {
            "time": 1648598400,
            "value": 9879397,
            "datetime": "2022-03-30T00:00:00",
            "time_iso": "2022-03-30T00:00:00"
          },
          {
            "time": 1648857600,
            "value": 9890448,
            "datetime": "2022-04-02T00:00:00",
            "time_iso": "2022-04-02T00:00:00"
          },
          {
            "time": 1649030400,
            "value": 9893603,
            "datetime": "2022-04-04T00:00:00",
            "time_iso": "2022-04-04T00:00:00"
          },
          {
            "time": 1649548800,
            "value": 9899292,
            "datetime": "2022-04-10T00:00:00",
            "time_iso": "2022-04-10T00:00:00"
          },
          {
            "time": 1649808000,
            "value": 9901377,
            "datetime": "2022-04-13T00:00:00",
            "time_iso": "2022-04-13T00:00:00"
          },
          {
            "time": 1650067200,
            "value": 9904741,
            "datetime": "2022-04-16T00:00:00",
            "time_iso": "2022-04-16T00:00:00"
          },
          {
            "time": 1650326400,
            "value": 9908622,
            "datetime": "2022-04-19T00:00:00",
            "time_iso": "2022-04-19T00:00:00"
          },
          {
            "time": 1650499200,
            "value": 9911012,
            "datetime": "2022-04-21T00:00:00",
            "time_iso": "2022-04-21T00:00:00"
          },
          {
            "time": 1650585600,
            "value": 9912497,
            "datetime": "2022-04-22T00:00:00",
            "time_iso": "2022-04-22T00:00:00"
          },
          {
            "time": 1650758400,
            "value": 9915919,
            "datetime": "2022-04-24T00:00:00",
            "time_iso": "2022-04-24T00:00:00"
          },
          {
            "time": 1650931200,
            "value": 9918976,
            "datetime": "2022-04-26T00:00:00",
            "time_iso": "2022-04-26T00:00:00"
          },
          {
            "time": 1651017600,
            "value": 9920068,
            "datetime": "2022-04-27T00:00:00",
            "time_iso": "2022-04-27T00:00:00"
          },
          {
            "time": 1651708800,
            "value": 9930467,
            "datetime": "2022-05-05T00:00:00",
            "time_iso": "2022-05-05T00:00:00"
          },
          {
            "time": 1652400000,
            "value": 9939645,
            "datetime": "2022-05-13T00:00:00",
            "time_iso": "2022-05-13T00:00:00"
          },
          {
            "time": 1652745600,
            "value": 10008982,
            "datetime": "2022-05-17T00:00:00",
            "time_iso": "2022-05-17T00:00:00"
          },
          {
            "time": 1653091200,
            "value": 10022019,
            "datetime": "2022-05-21T00:00:00",
            "time_iso": "2022-05-21T00:00:00"
          },
          {
            "time": 1653350400,
            "value": 10029242,
            "datetime": "2022-05-24T00:00:00",
            "time_iso": "2022-05-24T00:00:00"
          },
          {
            "time": 1653436800,
            "value": 10031227,
            "datetime": "2022-05-25T00:00:00",
            "time_iso": "2022-05-25T00:00:00"
          },
          {
            "time": 1653782400,
            "value": 10037379,
            "datetime": "2022-05-29T00:00:00",
            "time_iso": "2022-05-29T00:00:00"
          },
          {
            "time": 1653955200,
            "value": 10039550,
            "datetime": "2022-05-31T00:00:00",
            "time_iso": "2022-05-31T00:00:00"
          },
          {
            "time": 1654214400,
            "value": 10041947,
            "datetime": "2022-06-03T00:00:00",
            "time_iso": "2022-06-03T00:00:00"
          },
          {
            "time": 1654300800,
            "value": 10042566,
            "datetime": "2022-06-04T00:00:00",
            "time_iso": "2022-06-04T00:00:00"
          },
          {
            "time": 1654560000,
            "value": 10044046,
            "datetime": "2022-06-07T00:00:00",
            "time_iso": "2022-06-07T00:00:00"
          },
          {
            "time": 1654819200,
            "value": 10045220,
            "datetime": "2022-06-10T00:00:00",
            "time_iso": "2022-06-10T00:00:00"
          },
          {
            "time": 1654905600,
            "value": 10045599,
            "datetime": "2022-06-11T00:00:00",
            "time_iso": "2022-06-11T00:00:00"
          },
          {
            "time": 1655164800,
            "value": 10046870,
            "datetime": "2022-06-14T00:00:00",
            "time_iso": "2022-06-14T00:00:00"
          },
          {
            "time": 1655424000,
            "value": 10048595,
            "datetime": "2022-06-17T00:00:00",
            "time_iso": "2022-06-17T00:00:00"
          },
          {
            "time": 1655769600,
            "value": 10052163,
            "datetime": "2022-06-21T00:00:00",
            "time_iso": "2022-06-21T00:00:00"
          },
          {
            "time": 1656028800,
            "value": 10056212,
            "datetime": "2022-06-24T00:00:00",
            "time_iso": "2022-06-24T00:00:00"
          },
          {
            "time": 1656201600,
            "value": 10059748,
            "datetime": "2022-06-26T00:00:00",
            "time_iso": "2022-06-26T00:00:00"
          },
          {
            "time": 1656288000,
            "value": 10061802,
            "datetime": "2022-06-27T00:00:00",
            "time_iso": "2022-06-27T00:00:00"
          },
          {
            "time": 1656460800,
            "value": 10066544,
            "datetime": "2022-06-29T00:00:00",
            "time_iso": "2022-06-29T00:00:00"
          },
          {
            "time": 1656720000,
            "value": 10075424,
            "datetime": "2022-07-02T00:00:00",
            "time_iso": "2022-07-02T00:00:00"
          },
          {
            "time": 1656806400,
            "value": 10078903,
            "datetime": "2022-07-03T00:00:00",
            "time_iso": "2022-07-03T00:00:00"
          },
          {
            "time": 1656979200,
            "value": 10086713,
            "datetime": "2022-07-05T00:00:00",
            "time_iso": "2022-07-05T00:00:00"
          },
          {
            "time": 1657065600,
            "value": 10114515,
            "datetime": "2022-07-06T00:00:00",
            "time_iso": "2022-07-06T00:00:00"
          },
          {
            "time": 1657238400,
            "value": 10147484,
            "datetime": "2022-07-08T00:00:00",
            "time_iso": "2022-07-08T00:00:00"
          },
          {
            "time": 1657324800,
            "value": 10160337,
            "datetime": "2022-07-09T00:00:00",
            "time_iso": "2022-07-09T00:00:00"
          },
          {
            "time": 1657497600,
            "value": 10185576,
            "datetime": "2022-07-11T00:00:00",
            "time_iso": "2022-07-11T00:00:00"
          },
          {
            "time": 1657670400,
            "value": 10212666,
            "datetime": "2022-07-13T00:00:00",
            "time_iso": "2022-07-13T00:00:00"
          },
          {
            "time": 1657843200,
            "value": 10226030,
            "datetime": "2022-07-15T00:00:00",
            "time_iso": "2022-07-15T00:00:00"
          },
          {
            "time": 1658016000,
            "value": 10237011,
            "datetime": "2022-07-17T00:00:00",
            "time_iso": "2022-07-17T00:00:00"
          },
          {
            "time": 1658188800,
            "value": 10246069,
            "datetime": "2022-07-19T00:00:00",
            "time_iso": "2022-07-19T00:00:00"
          },
          {
            "time": 1658361600,
            "value": 10253666,
            "datetime": "2022-07-21T00:00:00",
            "time_iso": "2022-07-21T00:00:00"
          },
          {
            "time": 1658534400,
            "value": 10260263,
            "datetime": "2022-07-23T00:00:00",
            "time_iso": "2022-07-23T00:00:00"
          },
          {
            "time": 1658707200,
            "value": 10266322,
            "datetime": "2022-07-25T00:00:00",
            "time_iso": "2022-07-25T00:00:00"
          },
          {
            "time": 1658880000,
            "value": 10272304,
            "datetime": "2022-07-27T00:00:00",
            "time_iso": "2022-07-27T00:00:00"
          },
          {
            "time": 1659052800,
            "value": 10278671,
            "datetime": "2022-07-29T00:00:00",
            "time_iso": "2022-07-29T00:00:00"
          },
          {
            "time": 1659312000,
            "value": 10289952,
            "datetime": "2022-08-01T00:00:00",
            "time_iso": "2022-08-01T00:00:00"
          },
          {
            "time": 1659398400,
            "value": 10294405,
            "datetime": "2022-08-02T00:00:00",
            "time_iso": "2022-08-02T00:00:00"
          },
          {
            "time": 1659744000,
            "value": 10314903,
            "datetime": "2022-08-06T00:00:00",
            "time_iso": "2022-08-06T00:00:00"
          },
          {
            "time": 1659830400,
            "value": 10319164,
            "datetime": "2022-08-07T00:00:00",
            "time_iso": "2022-08-07T00:00:00"
          },
          {
            "time": 1660003200,
            "value": 10326327,
            "datetime": "2022-08-09T00:00:00",
            "time_iso": "2022-08-09T00:00:00"
          },
          {
            "time": 1660176000,
            "value": 10332130,
            "datetime": "2022-08-11T00:00:00",
            "time_iso": "2022-08-11T00:00:00"
          },
          {
            "time": 1660435200,
            "value": 10339475,
            "datetime": "2022-08-14T00:00:00",
            "time_iso": "2022-08-14T00:00:00"
          },
          {
            "time": 1660608000,
            "value": 10344260,
            "datetime": "2022-08-16T00:00:00",
            "time_iso": "2022-08-16T00:00:00"
          },
          {
            "time": 1660867200,
            "value": 10352634,
            "datetime": "2022-08-19T00:00:00",
            "time_iso": "2022-08-19T00:00:00"
          },
          {
            "time": 1661040000,
            "value": 10359808,
            "datetime": "2022-08-21T00:00:00",
            "time_iso": "2022-08-21T00:00:00"
          },
          {
            "time": 1661126400,
            "value": 10364077,
            "datetime": "2022-08-22T00:00:00",
            "time_iso": "2022-08-22T00:00:00"
          },
          {
            "time": 1661385600,
            "value": 10380428,
            "datetime": "2022-08-25T00:00:00",
            "time_iso": "2022-08-25T00:00:00"
          },
          {
            "time": 1661558400,
            "value": 10394964,
            "datetime": "2022-08-27T00:00:00",
            "time_iso": "2022-08-27T00:00:00"
          },
          {
            "time": 1661904000,
            "value": 10506949,
            "datetime": "2022-08-31T00:00:00",
            "time_iso": "2022-08-31T00:00:00"
          },
          {
            "time": 1661990400,
            "value": 10516767,
            "datetime": "2022-09-01T00:00:00",
            "time_iso": "2022-09-01T00:00:00"
          },
          {
            "time": 1662249600,
            "value": 10536162,
            "datetime": "2022-09-04T00:00:00",
            "time_iso": "2022-09-04T00:00:00"
          },
          {
            "time": 1662422400,
            "value": 10543862,
            "datetime": "2022-09-06T00:00:00",
            "time_iso": "2022-09-06T00:00:00"
          },
          {
            "time": 1662681600,
            "value": 10553869,
            "datetime": "2022-09-09T00:00:00",
            "time_iso": "2022-09-09T00:00:00"
          },
          {
            "time": 1662768000,
            "value": 10558053,
            "datetime": "2022-09-10T00:00:00",
            "time_iso": "2022-09-10T00:00:00"
          },
          {
            "time": 1662854400,
            "value": 10563188,
            "datetime": "2022-09-11T00:00:00",
            "time_iso": "2022-09-11T00:00:00"
          },
          {
            "time": 1662940800,
            "value": 10569587,
            "datetime": "2022-09-12T00:00:00",
            "time_iso": "2022-09-12T00:00:00"
          },
          {
            "time": 1663027200,
            "value": 10577567,
            "datetime": "2022-09-13T00:00:00",
            "time_iso": "2022-09-13T00:00:00"
          },
          {
            "time": 1663113600,
            "value": 10587442,
            "datetime": "2022-09-14T00:00:00",
            "time_iso": "2022-09-14T00:00:00"
          },
          {
            "time": 1663200000,
            "value": 10609161,
            "datetime": "2022-09-15T00:00:00",
            "time_iso": "2022-09-15T00:00:00"
          },
          {
            "time": 1663372800,
            "value": 10629578,
            "datetime": "2022-09-17T00:00:00",
            "time_iso": "2022-09-17T00:00:00"
          },
          {
            "time": 1663545600,
            "value": 10643255,
            "datetime": "2022-09-19T00:00:00",
            "time_iso": "2022-09-19T00:00:00"
          },
          {
            "time": 1663718400,
            "value": 10653605,
            "datetime": "2022-09-21T00:00:00",
            "time_iso": "2022-09-21T00:00:00"
          },
          {
            "time": 1663977600,
            "value": 10670356,
            "datetime": "2022-09-24T00:00:00",
            "time_iso": "2022-09-24T00:00:00"
          },
          {
            "time": 1664150400,
            "value": 10687319,
            "datetime": "2022-09-26T00:00:00",
            "time_iso": "2022-09-26T00:00:00"
          },
          {
            "time": 1664323200,
            "value": 10716296,
            "datetime": "2022-09-28T00:00:00",
            "time_iso": "2022-09-28T00:00:00"
          },
          {
            "time": 1664409600,
            "value": 10720337,
            "datetime": "2022-09-29T00:00:00",
            "time_iso": "2022-09-29T00:00:00"
          },
          {
            "time": 1664496000,
            "value": 10724013,
            "datetime": "2022-09-30T00:00:00",
            "time_iso": "2022-09-30T00:00:00"
          },
          {
            "time": 1664582400,
            "value": 10727346,
            "datetime": "2022-10-01T00:00:00",
            "time_iso": "2022-10-01T00:00:00"
          },
          {
            "time": 1664755200,
            "value": 10733063,
            "datetime": "2022-10-03T00:00:00",
            "time_iso": "2022-10-03T00:00:00"
          },
          {
            "time": 1664928000,
            "value": 10737654,
            "datetime": "2022-10-05T00:00:00",
            "time_iso": "2022-10-05T00:00:00"
          },
          {
            "time": 1665014400,
            "value": 10739579,
            "datetime": "2022-10-06T00:00:00",
            "time_iso": "2022-10-06T00:00:00"
          },
          {
            "time": 1665100800,
            "value": 10741284,
            "datetime": "2022-10-07T00:00:00",
            "time_iso": "2022-10-07T00:00:00"
          },
          {
            "time": 1665187200,
            "value": 10742790,
            "datetime": "2022-10-08T00:00:00",
            "time_iso": "2022-10-08T00:00:00"
          },
          {
            "time": 1665273600,
            "value": 10744118,
            "datetime": "2022-10-09T00:00:00",
            "time_iso": "2022-10-09T00:00:00"
          },
          {
            "time": 1665360000,
            "value": 10745289,
            "datetime": "2022-10-10T00:00:00",
            "time_iso": "2022-10-10T00:00:00"
          },
          {
            "time": 1665446400,
            "value": 10746323,
            "datetime": "2022-10-11T00:00:00",
            "time_iso": "2022-10-11T00:00:00"
          },
          {
            "time": 1665532800,
            "value": 10747241,
            "datetime": "2022-10-12T00:00:00",
            "time_iso": "2022-10-12T00:00:00"
          },
          {
            "time": 1665619200,
            "value": 10748064,
            "datetime": "2022-10-13T00:00:00",
            "time_iso": "2022-10-13T00:00:00"
          },
          {
            "time": 1665705600,
            "value": 10748813,
            "datetime": "2022-10-14T00:00:00",
            "time_iso": "2022-10-14T00:00:00"
          },
          {
            "time": 1665878400,
            "value": 10750169,
            "datetime": "2022-10-16T00:00:00",
            "time_iso": "2022-10-16T00:00:00"
          },
          {
            "time": 1665964800,
            "value": 10750817,
            "datetime": "2022-10-17T00:00:00",
            "time_iso": "2022-10-17T00:00:00"
          },
          {
            "time": 1666137600,
            "value": 10752161,
            "datetime": "2022-10-19T00:00:00",
            "time_iso": "2022-10-19T00:00:00"
          },
          {
            "time": 1666224000,
            "value": 10752897,
            "datetime": "2022-10-20T00:00:00",
            "time_iso": "2022-10-20T00:00:00"
          },
          {
            "time": 1666396800,
            "value": 10754601,
            "datetime": "2022-10-22T00:00:00",
            "time_iso": "2022-10-22T00:00:00"
          },
          {
            "time": 1666742400,
            "value": 10759516,
            "datetime": "2022-10-26T00:00:00",
            "time_iso": "2022-10-26T00:00:00"
          },
          {
            "time": 1667001600,
            "value": 10765173,
            "datetime": "2022-10-29T00:00:00",
            "time_iso": "2022-10-29T00:00:00"
          },
          {
            "time": 1667174400,
            "value": 10770195,
            "datetime": "2022-10-31T00:00:00",
            "time_iso": "2022-10-31T00:00:00"
          },
          {
            "time": 1667260800,
            "value": 10773142,
            "datetime": "2022-11-01T00:00:00",
            "time_iso": "2022-11-01T00:00:00"
          },
          {
            "time": 1667433600,
            "value": 10780015,
            "datetime": "2022-11-03T00:00:00",
            "time_iso": "2022-11-03T00:00:00"
          },
          {
            "time": 1667520000,
            "value": 10783982,
            "datetime": "2022-11-04T00:00:00",
            "time_iso": "2022-11-04T00:00:00"
          },
          {
            "time": 1667692800,
            "value": 10810388,
            "datetime": "2022-11-06T00:00:00",
            "time_iso": "2022-11-06T00:00:00"
          },
          {
            "time": 1667779200,
            "value": 10829530,
            "datetime": "2022-11-07T00:00:00",
            "time_iso": "2022-11-07T00:00:00"
          },
          {
            "time": 1667865600,
            "value": 10852482,
            "datetime": "2022-11-08T00:00:00",
            "time_iso": "2022-11-08T00:00:00"
          },
          {
            "time": 1667952000,
            "value": 10873108,
            "datetime": "2022-11-09T00:00:00",
            "time_iso": "2022-11-09T00:00:00"
          },
          {
            "time": 1668038400,
            "value": 10885273,
            "datetime": "2022-11-10T00:00:00",
            "time_iso": "2022-11-10T00:00:00"
          },
          {
            "time": 1668902400,
            "value": 10916046,
            "datetime": "2022-11-20T00:00:00",
            "time_iso": "2022-11-20T00:00:00"
          },
          {
            "time": 1669334400,
            "value": 10929077,
            "datetime": "2022-11-25T00:00:00",
            "time_iso": "2022-11-25T00:00:00"
          },
          {
            "time": 1669680000,
            "value": 10937709,
            "datetime": "2022-11-29T00:00:00",
            "time_iso": "2022-11-29T00:00:00"
          },
          {
            "time": 1669852800,
            "value": 10942190,
            "datetime": "2022-12-01T00:00:00",
            "time_iso": "2022-12-01T00:00:00"
          },
          {
            "time": 1670025600,
            "value": 10947152,
            "datetime": "2022-12-03T00:00:00",
            "time_iso": "2022-12-03T00:00:00"
          },
          {
            "time": 1670198400,
            "value": 10952873,
            "datetime": "2022-12-05T00:00:00",
            "time_iso": "2022-12-05T00:00:00"
          },
          {
            "time": 1670371200,
            "value": 10959629,
            "datetime": "2022-12-07T00:00:00",
            "time_iso": "2022-12-07T00:00:00"
          },
          {
            "time": 1670544000,
            "value": 10967699,
            "datetime": "2022-12-09T00:00:00",
            "time_iso": "2022-12-09T00:00:00"
          },
          {
            "time": 1670716800,
            "value": 10977361,
            "datetime": "2022-12-11T00:00:00",
            "time_iso": "2022-12-11T00:00:00"
          },
          {
            "time": 1670889600,
            "value": 10988892,
            "datetime": "2022-12-13T00:00:00",
            "time_iso": "2022-12-13T00:00:00"
          },
          {
            "time": 1671062400,
            "value": 11016961,
            "datetime": "2022-12-15T00:00:00",
            "time_iso": "2022-12-15T00:00:00"
          },
          {
            "time": 1671235200,
            "value": 11020219,
            "datetime": "2022-12-17T00:00:00",
            "time_iso": "2022-12-17T00:00:00"
          },
          {
            "time": 1671408000,
            "value": 11023251,
            "datetime": "2022-12-19T00:00:00",
            "time_iso": "2022-12-19T00:00:00"
          },
          {
            "time": 1671580800,
            "value": 11026064,
            "datetime": "2022-12-21T00:00:00",
            "time_iso": "2022-12-21T00:00:00"
          },
          {
            "time": 1671753600,
            "value": 11028667,
            "datetime": "2022-12-23T00:00:00",
            "time_iso": "2022-12-23T00:00:00"
          },
          {
            "time": 1671926400,
            "value": 11031070,
            "datetime": "2022-12-25T00:00:00",
            "time_iso": "2022-12-25T00:00:00"
          },
          {
            "time": 1672099200,
            "value": 11033280,
            "datetime": "2022-12-27T00:00:00",
            "time_iso": "2022-12-27T00:00:00"
          },
          {
            "time": 1672272000,
            "value": 11035306,
            "datetime": "2022-12-29T00:00:00",
            "time_iso": "2022-12-29T00:00:00"
          },
          {
            "time": 1672444800,
            "value": 11037157,
            "datetime": "2022-12-31T00:00:00",
            "time_iso": "2022-12-31T00:00:00"
          },
          {
            "time": 1672617600,
            "value": 11038842,
            "datetime": "2023-01-02T00:00:00",
            "time_iso": "2023-01-02T00:00:00"
          },
          {
            "time": 1672790400,
            "value": 11040369,
            "datetime": "2023-01-04T00:00:00",
            "time_iso": "2023-01-04T00:00:00"
          },
          {
            "time": 1672963200,
            "value": 11041747,
            "datetime": "2023-01-06T00:00:00",
            "time_iso": "2023-01-06T00:00:00"
          },
          {
            "time": 1673136000,
            "value": 11042984,
            "datetime": "2023-01-08T00:00:00",
            "time_iso": "2023-01-08T00:00:00"
          },
          {
            "time": 1673308800,
            "value": 11044090,
            "datetime": "2023-01-10T00:00:00",
            "time_iso": "2023-01-10T00:00:00"
          },
          {
            "time": 1673481600,
            "value": 11045073,
            "datetime": "2023-01-12T00:00:00",
            "time_iso": "2023-01-12T00:00:00"
          },
          {
            "time": 1673654400,
            "value": 11045942,
            "datetime": "2023-01-14T00:00:00",
            "time_iso": "2023-01-14T00:00:00"
          },
          {
            "time": 1673827200,
            "value": 11046705,
            "datetime": "2023-01-16T00:00:00",
            "time_iso": "2023-01-16T00:00:00"
          },
          {
            "time": 1674172800,
            "value": 11047948,
            "datetime": "2023-01-20T00:00:00",
            "time_iso": "2023-01-20T00:00:00"
          },
          {
            "time": 1674259200,
            "value": 11048206,
            "datetime": "2023-01-21T00:00:00",
            "time_iso": "2023-01-21T00:00:00"
          },
          {
            "time": 1674432000,
            "value": 11048668,
            "datetime": "2023-01-23T00:00:00",
            "time_iso": "2023-01-23T00:00:00"
          },
          {
            "time": 1674604800,
            "value": 11049063,
            "datetime": "2023-01-25T00:00:00",
            "time_iso": "2023-01-25T00:00:00"
          },
          {
            "time": 1674777600,
            "value": 11049399,
            "datetime": "2023-01-27T00:00:00",
            "time_iso": "2023-01-27T00:00:00"
          },
          {
            "time": 1675641600,
            "value": 11050517,
            "datetime": "2023-02-06T00:00:00",
            "time_iso": "2023-02-06T00:00:00"
          },
          {
            "time": 1675987200,
            "value": 11050862,
            "datetime": "2023-02-10T00:00:00",
            "time_iso": "2023-02-10T00:00:00"
          },
          {
            "time": 1676073600,
            "value": 11050953,
            "datetime": "2023-02-11T00:00:00",
            "time_iso": "2023-02-11T00:00:00"
          },
          {
            "time": 1676246400,
            "value": 11051147,
            "datetime": "2023-02-13T00:00:00",
            "time_iso": "2023-02-13T00:00:00"
          },
          {
            "time": 1676419200,
            "value": 11051366,
            "datetime": "2023-02-15T00:00:00",
            "time_iso": "2023-02-15T00:00:00"
          },
          {
            "time": 1676592000,
            "value": 11051618,
            "datetime": "2023-02-17T00:00:00",
            "time_iso": "2023-02-17T00:00:00"
          },
          {
            "time": 1676764800,
            "value": 11051911,
            "datetime": "2023-02-19T00:00:00",
            "time_iso": "2023-02-19T00:00:00"
          },
          {
            "time": 1676937600,
            "value": 11052256,
            "datetime": "2023-02-21T00:00:00",
            "time_iso": "2023-02-21T00:00:00"
          },
          {
            "time": 1677110400,
            "value": 11052659,
            "datetime": "2023-02-23T00:00:00",
            "time_iso": "2023-02-23T00:00:00"
          },
          {
            "time": 1677283200,
            "value": 11053130,
            "datetime": "2023-02-25T00:00:00",
            "time_iso": "2023-02-25T00:00:00"
          },
          {
            "time": 1677456000,
            "value": 11053677,
            "datetime": "2023-02-27T00:00:00",
            "time_iso": "2023-02-27T00:00:00"
          },
          {
            "time": 1677628800,
            "value": 11054310,
            "datetime": "2023-03-01T00:00:00",
            "time_iso": "2023-03-01T00:00:00"
          },
          {
            "time": 1677801600,
            "value": 11055037,
            "datetime": "2023-03-03T00:00:00",
            "time_iso": "2023-03-03T00:00:00"
          },
          {
            "time": 1677974400,
            "value": 11055866,
            "datetime": "2023-03-05T00:00:00",
            "time_iso": "2023-03-05T00:00:00"
          },
          {
            "time": 1678060800,
            "value": 11056321,
            "datetime": "2023-03-06T00:00:00",
            "time_iso": "2023-03-06T00:00:00"
          },
          {
            "time": 1678233600,
            "value": 11057320,
            "datetime": "2023-03-08T00:00:00",
            "time_iso": "2023-03-08T00:00:00"
          },
          {
            "time": 1678406400,
            "value": 11058444,
            "datetime": "2023-03-10T00:00:00",
            "time_iso": "2023-03-10T00:00:00"
          },
          {
            "time": 1678579200,
            "value": 11059700,
            "datetime": "2023-03-12T00:00:00",
            "time_iso": "2023-03-12T00:00:00"
          },
          {
            "time": 1678665600,
            "value": 11060380,
            "datetime": "2023-03-13T00:00:00",
            "time_iso": "2023-03-13T00:00:00"
          },
          {
            "time": 1678838400,
            "value": 11061852,
            "datetime": "2023-03-15T00:00:00",
            "time_iso": "2023-03-15T00:00:00"
          },
          {
            "time": 1679011200,
            "value": 11063478,
            "datetime": "2023-03-17T00:00:00",
            "time_iso": "2023-03-17T00:00:00"
          },
          {
            "time": 1679097600,
            "value": 11064352,
            "datetime": "2023-03-18T00:00:00",
            "time_iso": "2023-03-18T00:00:00"
          },
          {
            "time": 1679184000,
            "value": 11065268,
            "datetime": "2023-03-19T00:00:00",
            "time_iso": "2023-03-19T00:00:00"
          },
          {
            "time": 1679356800,
            "value": 11067229,
            "datetime": "2023-03-21T00:00:00",
            "time_iso": "2023-03-21T00:00:00"
          },
          {
            "time": 1679529600,
            "value": 11069371,
            "datetime": "2023-03-23T00:00:00",
            "time_iso": "2023-03-23T00:00:00"
          },
          {
            "time": 1679616000,
            "value": 11070513,
            "datetime": "2023-03-24T00:00:00",
            "time_iso": "2023-03-24T00:00:00"
          },
          {
            "time": 1679702400,
            "value": 11071702,
            "datetime": "2023-03-25T00:00:00",
            "time_iso": "2023-03-25T00:00:00"
          },
          {
            "time": 1679961600,
            "value": 11075573,
            "datetime": "2023-03-28T00:00:00",
            "time_iso": "2023-03-28T00:00:00"
          },
          {
            "time": 1680048000,
            "value": 11076967,
            "datetime": "2023-03-29T00:00:00",
            "time_iso": "2023-03-29T00:00:00"
          },
          {
            "time": 1680220800,
            "value": 11079918,
            "datetime": "2023-03-31T00:00:00",
            "time_iso": "2023-03-31T00:00:00"
          },
          {
            "time": 1680307200,
            "value": 11081477,
            "datetime": "2023-04-01T00:00:00",
            "time_iso": "2023-04-01T00:00:00"
          },
          {
            "time": 1680393600,
            "value": 11083093,
            "datetime": "2023-04-02T00:00:00",
            "time_iso": "2023-04-02T00:00:00"
          },
          {
            "time": 1680480000,
            "value": 11084768,
            "datetime": "2023-04-03T00:00:00",
            "time_iso": "2023-04-03T00:00:00"
          },
          {
            "time": 1680652800,
            "value": 11116608,
            "datetime": "2023-04-05T00:00:00",
            "time_iso": "2023-04-05T00:00:00"
          },
          {
            "time": 1680912000,
            "value": 11122799,
            "datetime": "2023-04-08T00:00:00",
            "time_iso": "2023-04-08T00:00:00"
          },
          {
            "time": 1681084800,
            "value": 11126529,
            "datetime": "2023-04-10T00:00:00",
            "time_iso": "2023-04-10T00:00:00"
          },
          {
            "time": 1681257600,
            "value": 11129959,
            "datetime": "2023-04-12T00:00:00",
            "time_iso": "2023-04-12T00:00:00"
          },
          {
            "time": 1682467200,
            "value": 11146700,
            "datetime": "2023-04-26T00:00:00",
            "time_iso": "2023-04-26T00:00:00"
          },
          {
            "time": 1682640000,
            "value": 11148221,
            "datetime": "2023-04-28T00:00:00",
            "time_iso": "2023-04-28T00:00:00"
          },
          {
            "time": 1682812800,
            "value": 11149567,
            "datetime": "2023-04-30T00:00:00",
            "time_iso": "2023-04-30T00:00:00"
          },
          {
            "time": 1683072000,
            "value": 11151286,
            "datetime": "2023-05-03T00:00:00",
            "time_iso": "2023-05-03T00:00:00"
          },
          {
            "time": 1683158400,
            "value": 11151786,
            "datetime": "2023-05-04T00:00:00",
            "time_iso": "2023-05-04T00:00:00"
          },
          {
            "time": 1683244800,
            "value": 11152253,
            "datetime": "2023-05-05T00:00:00",
            "time_iso": "2023-05-05T00:00:00"
          },
          {
            "time": 1683331200,
            "value": 11152688,
            "datetime": "2023-05-06T00:00:00",
            "time_iso": "2023-05-06T00:00:00"
          },
          {
            "time": 1683417600,
            "value": 11153093,
            "datetime": "2023-05-07T00:00:00",
            "time_iso": "2023-05-07T00:00:00"
          },
          {
            "time": 1683504000,
            "value": 11153470,
            "datetime": "2023-05-08T00:00:00",
            "time_iso": "2023-05-08T00:00:00"
          },
          {
            "time": 1683590400,
            "value": 11153821,
            "datetime": "2023-05-09T00:00:00",
            "time_iso": "2023-05-09T00:00:00"
          },
          {
            "time": 1683676800,
            "value": 11154147,
            "datetime": "2023-05-10T00:00:00",
            "time_iso": "2023-05-10T00:00:00"
          },
          {
            "time": 1683763200,
            "value": 11154449,
            "datetime": "2023-05-11T00:00:00",
            "time_iso": "2023-05-11T00:00:00"
          },
          {
            "time": 1683849600,
            "value": 11154731,
            "datetime": "2023-05-12T00:00:00",
            "time_iso": "2023-05-12T00:00:00"
          },
          {
            "time": 1683936000,
            "value": 11154993,
            "datetime": "2023-05-13T00:00:00",
            "time_iso": "2023-05-13T00:00:00"
          },
          {
            "time": 1684022400,
            "value": 11155237,
            "datetime": "2023-05-14T00:00:00",
            "time_iso": "2023-05-14T00:00:00"
          },
          {
            "time": 1684195200,
            "value": 11155679,
            "datetime": "2023-05-16T00:00:00",
            "time_iso": "2023-05-16T00:00:00"
          },
          {
            "time": 1684281600,
            "value": 11155880,
            "datetime": "2023-05-17T00:00:00",
            "time_iso": "2023-05-17T00:00:00"
          },
          {
            "time": 1684368000,
            "value": 11156070,
            "datetime": "2023-05-18T00:00:00",
            "time_iso": "2023-05-18T00:00:00"
          },
          {
            "time": 1684454400,
            "value": 11156252,
            "datetime": "2023-05-19T00:00:00",
            "time_iso": "2023-05-19T00:00:00"
          },
          {
            "time": 1687737600,
            "value": 11173663,
            "datetime": "2023-06-26T00:00:00",
            "time_iso": "2023-06-26T00:00:00"
          },
          {
            "time": 1687824000,
            "value": 11174851,
            "datetime": "2023-06-27T00:00:00",
            "time_iso": "2023-06-27T00:00:00"
          },
          {
            "time": 1687910400,
            "value": 11176100,
            "datetime": "2023-06-28T00:00:00",
            "time_iso": "2023-06-28T00:00:00"
          },
          {
            "time": 1688083200,
            "value": 11178787,
            "datetime": "2023-06-30T00:00:00",
            "time_iso": "2023-06-30T00:00:00"
          },
          {
            "time": 1688169600,
            "value": 11180229,
            "datetime": "2023-07-01T00:00:00",
            "time_iso": "2023-07-01T00:00:00"
          },
          {
            "time": 1688342400,
            "value": 11183316,
            "datetime": "2023-07-03T00:00:00",
            "time_iso": "2023-07-03T00:00:00"
          },
          {
            "time": 1688515200,
            "value": 11186689,
            "datetime": "2023-07-05T00:00:00",
            "time_iso": "2023-07-05T00:00:00"
          },
          {
            "time": 1688688000,
            "value": 11190360,
            "datetime": "2023-07-07T00:00:00",
            "time_iso": "2023-07-07T00:00:00"
          },
          {
            "time": 1688860800,
            "value": 11194344,
            "datetime": "2023-07-09T00:00:00",
            "time_iso": "2023-07-09T00:00:00"
          },
          {
            "time": 1689033600,
            "value": 11214096,
            "datetime": "2023-07-11T00:00:00",
            "time_iso": "2023-07-11T00:00:00"
          },
          {
            "time": 1689206400,
            "value": 11221589,
            "datetime": "2023-07-13T00:00:00",
            "time_iso": "2023-07-13T00:00:00"
          },
          {
            "time": 1689379200,
            "value": 11228128,
            "datetime": "2023-07-15T00:00:00",
            "time_iso": "2023-07-15T00:00:00"
          },
          {
            "time": 1689552000,
            "value": 11233803,
            "datetime": "2023-07-17T00:00:00",
            "time_iso": "2023-07-17T00:00:00"
          },
          {
            "time": 1689811200,
            "value": 11240892,
            "datetime": "2023-07-20T00:00:00",
            "time_iso": "2023-07-20T00:00:00"
          },
          {
            "time": 1689984000,
            "value": 11244801,
            "datetime": "2023-07-22T00:00:00",
            "time_iso": "2023-07-22T00:00:00"
          },
          {
            "time": 1690588800,
            "value": 11254750,
            "datetime": "2023-07-29T00:00:00",
            "time_iso": "2023-07-29T00:00:00"
          },
          {
            "time": 1690761600,
            "value": 11256899,
            "datetime": "2023-07-31T00:00:00",
            "time_iso": "2023-07-31T00:00:00"
          },
          {
            "time": 1690934400,
            "value": 11258905,
            "datetime": "2023-08-02T00:00:00",
            "time_iso": "2023-08-02T00:00:00"
          },
          {
            "time": 1691107200,
            "value": 11260858,
            "datetime": "2023-08-04T00:00:00",
            "time_iso": "2023-08-04T00:00:00"
          },
          {
            "time": 1691280000,
            "value": 11262847,
            "datetime": "2023-08-06T00:00:00",
            "time_iso": "2023-08-06T00:00:00"
          },
          {
            "time": 1691452800,
            "value": 11264964,
            "datetime": "2023-08-08T00:00:00",
            "time_iso": "2023-08-08T00:00:00"
          },
          {
            "time": 1691625600,
            "value": 11267299,
            "datetime": "2023-08-10T00:00:00",
            "time_iso": "2023-08-10T00:00:00"
          },
          {
            "time": 1691798400,
            "value": 11269941,
            "datetime": "2023-08-12T00:00:00",
            "time_iso": "2023-08-12T00:00:00"
          },
          {
            "time": 1691971200,
            "value": 11272981,
            "datetime": "2023-08-14T00:00:00",
            "time_iso": "2023-08-14T00:00:00"
          },
          {
            "time": 1692144000,
            "value": 11276509,
            "datetime": "2023-08-16T00:00:00",
            "time_iso": "2023-08-16T00:00:00"
          },
          {
            "time": 1692316800,
            "value": 11280614,
            "datetime": "2023-08-18T00:00:00",
            "time_iso": "2023-08-18T00:00:00"
          },
          {
            "time": 1692489600,
            "value": 11285388,
            "datetime": "2023-08-20T00:00:00",
            "time_iso": "2023-08-20T00:00:00"
          },
          {
            "time": 1692662400,
            "value": 11290920,
            "datetime": "2023-08-22T00:00:00",
            "time_iso": "2023-08-22T00:00:00"
          },
          {
            "time": 1692835200,
            "value": 11297301,
            "datetime": "2023-08-24T00:00:00",
            "time_iso": "2023-08-24T00:00:00"
          },
          {
            "time": 1693008000,
            "value": 11309302,
            "datetime": "2023-08-26T00:00:00",
            "time_iso": "2023-08-26T00:00:00"
          },
          {
            "time": 1693180800,
            "value": 11318084,
            "datetime": "2023-08-28T00:00:00",
            "time_iso": "2023-08-28T00:00:00"
          },
          {
            "time": 1693353600,
            "value": 11326291,
            "datetime": "2023-08-30T00:00:00",
            "time_iso": "2023-08-30T00:00:00"
          },
          {
            "time": 1693526400,
            "value": 11333968,
            "datetime": "2023-09-01T00:00:00",
            "time_iso": "2023-09-01T00:00:00"
          },
          {
            "time": 1693699200,
            "value": 11341159,
            "datetime": "2023-09-03T00:00:00",
            "time_iso": "2023-09-03T00:00:00"
          },
          {
            "time": 1693872000,
            "value": 11347911,
            "datetime": "2023-09-05T00:00:00",
            "time_iso": "2023-09-05T00:00:00"
          },
          {
            "time": 1694044800,
            "value": 11354267,
            "datetime": "2023-09-07T00:00:00",
            "time_iso": "2023-09-07T00:00:00"
          },
          {
            "time": 1694217600,
            "value": 11360272,
            "datetime": "2023-09-09T00:00:00",
            "time_iso": "2023-09-09T00:00:00"
          },
          {
            "time": 1694390400,
            "value": 11365973,
            "datetime": "2023-09-11T00:00:00",
            "time_iso": "2023-09-11T00:00:00"
          },
          {
            "time": 1694563200,
            "value": 11371412,
            "datetime": "2023-09-13T00:00:00",
            "time_iso": "2023-09-13T00:00:00"
          },
          {
            "time": 1694736000,
            "value": 11376637,
            "datetime": "2023-09-15T00:00:00",
            "time_iso": "2023-09-15T00:00:00"
          },
          {
            "time": 1694908800,
            "value": 11381691,
            "datetime": "2023-09-17T00:00:00",
            "time_iso": "2023-09-17T00:00:00"
          },
          {
            "time": 1695081600,
            "value": 11386619,
            "datetime": "2023-09-19T00:00:00",
            "time_iso": "2023-09-19T00:00:00"
          },
          {
            "time": 1695254400,
            "value": 11391467,
            "datetime": "2023-09-21T00:00:00",
            "time_iso": "2023-09-21T00:00:00"
          },
          {
            "time": 1696377600,
            "value": 11417816,
            "datetime": "2023-10-04T00:00:00",
            "time_iso": "2023-10-04T00:00:00"
          },
          {
            "time": 1696550400,
            "value": 11454597,
            "datetime": "2023-10-06T00:00:00",
            "time_iso": "2023-10-06T00:00:00"
          }
        ]
      },
      "media_count": {
        "value": 5715,
        "history": [
          {
            "time": 1542412800,
            "datetime": "2018-11-17T00:00:00",
            "time_iso": "2018-11-17T00:00:00",
            "value": 4534
          },
          {
            "time": 1542672000,
            "datetime": "2018-11-20T00:00:00",
            "time_iso": "2018-11-20T00:00:00",
            "value": 4535
          },
          {
            "time": 1542931200,
            "datetime": "2018-11-23T00:00:00",
            "time_iso": "2018-11-23T00:00:00",
            "value": 4537
          },
          {
            "time": 1543276800,
            "datetime": "2018-11-27T00:00:00",
            "time_iso": "2018-11-27T00:00:00",
            "value": 4540
          },
          {
            "time": 1543622400,
            "datetime": "2018-12-01T00:00:00",
            "time_iso": "2018-12-01T00:00:00",
            "value": 4542
          },
          {
            "time": 1543968000,
            "datetime": "2018-12-05T00:00:00",
            "time_iso": "2018-12-05T00:00:00",
            "value": 4544
          },
          {
            "time": 1544486400,
            "datetime": "2018-12-11T00:00:00",
            "time_iso": "2018-12-11T00:00:00",
            "value": 4547
          },
          {
            "time": 1544745600,
            "datetime": "2018-12-14T00:00:00",
            "time_iso": "2018-12-14T00:00:00",
            "value": 4549
          },
          {
            "time": 1545004800,
            "datetime": "2018-12-17T00:00:00",
            "time_iso": "2018-12-17T00:00:00",
            "value": 4549
          },
          {
            "time": 1545264000,
            "datetime": "2018-12-20T00:00:00",
            "time_iso": "2018-12-20T00:00:00",
            "value": 4552
          },
          {
            "time": 1545436800,
            "datetime": "2018-12-22T00:00:00",
            "time_iso": "2018-12-22T00:00:00",
            "value": 4554
          },
          {
            "time": 1545609600,
            "datetime": "2018-12-24T00:00:00",
            "time_iso": "2018-12-24T00:00:00",
            "value": 4554
          },
          {
            "time": 1545782400,
            "datetime": "2018-12-26T00:00:00",
            "time_iso": "2018-12-26T00:00:00",
            "value": 4555
          },
          {
            "time": 1545955200,
            "datetime": "2018-12-28T00:00:00",
            "time_iso": "2018-12-28T00:00:00",
            "value": 4552
          },
          {
            "time": 1546128000,
            "datetime": "2018-12-30T00:00:00",
            "time_iso": "2018-12-30T00:00:00",
            "value": 4556
          },
          {
            "time": 1546387200,
            "datetime": "2019-01-02T00:00:00",
            "time_iso": "2019-01-02T00:00:00",
            "value": 4556
          },
          {
            "time": 1546560000,
            "datetime": "2019-01-04T00:00:00",
            "time_iso": "2019-01-04T00:00:00",
            "value": 4556
          },
          {
            "time": 1546732800,
            "datetime": "2019-01-06T00:00:00",
            "time_iso": "2019-01-06T00:00:00",
            "value": 4556
          },
          {
            "time": 1546905600,
            "datetime": "2019-01-08T00:00:00",
            "time_iso": "2019-01-08T00:00:00",
            "value": 4556
          },
          {
            "time": 1547078400,
            "datetime": "2019-01-10T00:00:00",
            "time_iso": "2019-01-10T00:00:00",
            "value": 4556
          },
          {
            "time": 1547251200,
            "datetime": "2019-01-12T00:00:00",
            "time_iso": "2019-01-12T00:00:00",
            "value": 4556
          },
          {
            "time": 1547424000,
            "datetime": "2019-01-14T00:00:00",
            "time_iso": "2019-01-14T00:00:00",
            "value": 4556
          },
          {
            "time": 1547596800,
            "datetime": "2019-01-16T00:00:00",
            "time_iso": "2019-01-16T00:00:00",
            "value": 4556
          },
          {
            "time": 1547769600,
            "datetime": "2019-01-18T00:00:00",
            "time_iso": "2019-01-18T00:00:00",
            "value": 4556
          },
          {
            "time": 1547942400,
            "datetime": "2019-01-20T00:00:00",
            "time_iso": "2019-01-20T00:00:00",
            "value": 4556
          },
          {
            "time": 1548115200,
            "datetime": "2019-01-22T00:00:00",
            "time_iso": "2019-01-22T00:00:00",
            "value": 4556
          },
          {
            "time": 1552867200,
            "datetime": "2019-03-18T00:00:00",
            "time_iso": "2019-03-18T00:00:00",
            "value": 4583
          },
          {
            "time": 1553472000,
            "datetime": "2019-03-25T00:00:00",
            "time_iso": "2019-03-25T00:00:00",
            "value": 4587
          },
          {
            "time": 1553644800,
            "datetime": "2019-03-27T00:00:00",
            "time_iso": "2019-03-27T00:00:00",
            "value": 4591
          },
          {
            "time": 1553817600,
            "datetime": "2019-03-29T00:00:00",
            "time_iso": "2019-03-29T00:00:00",
            "value": 4592
          },
          {
            "time": 1553990400,
            "datetime": "2019-03-31T00:00:00",
            "time_iso": "2019-03-31T00:00:00",
            "value": 4596
          },
          {
            "time": 1554163200,
            "datetime": "2019-04-02T00:00:00",
            "time_iso": "2019-04-02T00:00:00",
            "value": 4598
          },
          {
            "time": 1554336000,
            "datetime": "2019-04-04T00:00:00",
            "time_iso": "2019-04-04T00:00:00",
            "value": 4599
          },
          {
            "time": 1554508800,
            "datetime": "2019-04-06T00:00:00",
            "time_iso": "2019-04-06T00:00:00",
            "value": 4601
          },
          {
            "time": 1554681600,
            "datetime": "2019-04-08T00:00:00",
            "time_iso": "2019-04-08T00:00:00",
            "value": 4601
          },
          {
            "time": 1554854400,
            "datetime": "2019-04-10T00:00:00",
            "time_iso": "2019-04-10T00:00:00",
            "value": 4602
          },
          {
            "time": 1555027200,
            "datetime": "2019-04-12T00:00:00",
            "time_iso": "2019-04-12T00:00:00",
            "value": 4602
          },
          {
            "time": 1555200000,
            "datetime": "2019-04-14T00:00:00",
            "time_iso": "2019-04-14T00:00:00",
            "value": 4603
          },
          {
            "time": 1555372800,
            "datetime": "2019-04-16T00:00:00",
            "time_iso": "2019-04-16T00:00:00",
            "value": 4604
          },
          {
            "time": 1555545600,
            "datetime": "2019-04-18T00:00:00",
            "time_iso": "2019-04-18T00:00:00",
            "value": 4607
          },
          {
            "time": 1555804800,
            "datetime": "2019-04-21T00:00:00",
            "time_iso": "2019-04-21T00:00:00",
            "value": 4611
          },
          {
            "time": 1555977600,
            "datetime": "2019-04-23T00:00:00",
            "time_iso": "2019-04-23T00:00:00",
            "value": 4611
          },
          {
            "time": 1556150400,
            "datetime": "2019-04-25T00:00:00",
            "time_iso": "2019-04-25T00:00:00",
            "value": 4613
          },
          {
            "time": 1556323200,
            "datetime": "2019-04-27T00:00:00",
            "time_iso": "2019-04-27T00:00:00",
            "value": 4615
          },
          {
            "time": 1556496000,
            "datetime": "2019-04-29T00:00:00",
            "time_iso": "2019-04-29T00:00:00",
            "value": 4614
          },
          {
            "time": 1556668800,
            "datetime": "2019-05-01T00:00:00",
            "time_iso": "2019-05-01T00:00:00",
            "value": 4615
          },
          {
            "time": 1556841600,
            "datetime": "2019-05-03T00:00:00",
            "time_iso": "2019-05-03T00:00:00",
            "value": 4617
          },
          {
            "time": 1557014400,
            "datetime": "2019-05-05T00:00:00",
            "time_iso": "2019-05-05T00:00:00",
            "value": 4618
          },
          {
            "time": 1557187200,
            "datetime": "2019-05-07T00:00:00",
            "time_iso": "2019-05-07T00:00:00",
            "value": 4618
          },
          {
            "time": 1557360000,
            "datetime": "2019-05-09T00:00:00",
            "time_iso": "2019-05-09T00:00:00",
            "value": 4618
          },
          {
            "time": 1557532800,
            "datetime": "2019-05-11T00:00:00",
            "time_iso": "2019-05-11T00:00:00",
            "value": 4620
          },
          {
            "time": 1557705600,
            "datetime": "2019-05-13T00:00:00",
            "time_iso": "2019-05-13T00:00:00",
            "value": 4620
          },
          {
            "time": 1557878400,
            "datetime": "2019-05-15T00:00:00",
            "time_iso": "2019-05-15T00:00:00",
            "value": 4622
          },
          {
            "time": 1558051200,
            "datetime": "2019-05-17T00:00:00",
            "time_iso": "2019-05-17T00:00:00",
            "value": 4622
          },
          {
            "time": 1558224000,
            "datetime": "2019-05-19T00:00:00",
            "time_iso": "2019-05-19T00:00:00",
            "value": 4625
          },
          {
            "time": 1558396800,
            "datetime": "2019-05-21T00:00:00",
            "time_iso": "2019-05-21T00:00:00",
            "value": 4625
          },
          {
            "time": 1558569600,
            "datetime": "2019-05-23T00:00:00",
            "time_iso": "2019-05-23T00:00:00",
            "value": 4625
          },
          {
            "time": 1558742400,
            "datetime": "2019-05-25T00:00:00",
            "time_iso": "2019-05-25T00:00:00",
            "value": 4626
          },
          {
            "time": 1558915200,
            "datetime": "2019-05-27T00:00:00",
            "time_iso": "2019-05-27T00:00:00",
            "value": 4628
          },
          {
            "time": 1559088000,
            "datetime": "2019-05-29T00:00:00",
            "time_iso": "2019-05-29T00:00:00",
            "value": 4629
          },
          {
            "time": 1559260800,
            "datetime": "2019-05-31T00:00:00",
            "time_iso": "2019-05-31T00:00:00",
            "value": 4630
          },
          {
            "time": 1559433600,
            "datetime": "2019-06-02T00:00:00",
            "time_iso": "2019-06-02T00:00:00",
            "value": 4632
          },
          {
            "time": 1559606400,
            "datetime": "2019-06-04T00:00:00",
            "time_iso": "2019-06-04T00:00:00",
            "value": 4632
          },
          {
            "time": 1559779200,
            "datetime": "2019-06-06T00:00:00",
            "time_iso": "2019-06-06T00:00:00",
            "value": 4633
          },
          {
            "time": 1559952000,
            "datetime": "2019-06-08T00:00:00",
            "time_iso": "2019-06-08T00:00:00",
            "value": 4635
          },
          {
            "time": 1560124800,
            "datetime": "2019-06-10T00:00:00",
            "time_iso": "2019-06-10T00:00:00",
            "value": 4636
          },
          {
            "time": 1560297600,
            "datetime": "2019-06-12T00:00:00",
            "time_iso": "2019-06-12T00:00:00",
            "value": 4636
          },
          {
            "time": 1560470400,
            "datetime": "2019-06-14T00:00:00",
            "time_iso": "2019-06-14T00:00:00",
            "value": 4637
          },
          {
            "time": 1560643200,
            "datetime": "2019-06-16T00:00:00",
            "time_iso": "2019-06-16T00:00:00",
            "value": 4638
          },
          {
            "time": 1560816000,
            "datetime": "2019-06-18T00:00:00",
            "time_iso": "2019-06-18T00:00:00",
            "value": 4638
          },
          {
            "time": 1560988800,
            "datetime": "2019-06-20T00:00:00",
            "time_iso": "2019-06-20T00:00:00",
            "value": 4639
          },
          {
            "time": 1562284800,
            "datetime": "2019-07-05T00:00:00",
            "time_iso": "2019-07-05T00:00:00",
            "value": 4645
          },
          {
            "time": 1562457600,
            "datetime": "2019-07-07T00:00:00",
            "time_iso": "2019-07-07T00:00:00",
            "value": 4646
          },
          {
            "time": 1562630400,
            "datetime": "2019-07-09T00:00:00",
            "time_iso": "2019-07-09T00:00:00",
            "value": 4646
          },
          {
            "time": 1562889600,
            "datetime": "2019-07-12T00:00:00",
            "time_iso": "2019-07-12T00:00:00",
            "value": 4645
          },
          {
            "time": 1563062400,
            "datetime": "2019-07-14T00:00:00",
            "time_iso": "2019-07-14T00:00:00",
            "value": 4646
          },
          {
            "time": 1563235200,
            "datetime": "2019-07-16T00:00:00",
            "time_iso": "2019-07-16T00:00:00",
            "value": 4648
          },
          {
            "time": 1563408000,
            "datetime": "2019-07-18T00:00:00",
            "time_iso": "2019-07-18T00:00:00",
            "value": 4651
          },
          {
            "time": 1563580800,
            "datetime": "2019-07-20T00:00:00",
            "time_iso": "2019-07-20T00:00:00",
            "value": 4655
          },
          {
            "time": 1563753600,
            "datetime": "2019-07-22T00:00:00",
            "time_iso": "2019-07-22T00:00:00",
            "value": 4659
          },
          {
            "time": 1563926400,
            "datetime": "2019-07-24T00:00:00",
            "time_iso": "2019-07-24T00:00:00",
            "value": 4661
          },
          {
            "time": 1564099200,
            "datetime": "2019-07-26T00:00:00",
            "time_iso": "2019-07-26T00:00:00",
            "value": 4665
          },
          {
            "time": 1564272000,
            "datetime": "2019-07-28T00:00:00",
            "time_iso": "2019-07-28T00:00:00",
            "value": 4669
          },
          {
            "time": 1564444800,
            "datetime": "2019-07-30T00:00:00",
            "time_iso": "2019-07-30T00:00:00",
            "value": 4671
          },
          {
            "time": 1564617600,
            "datetime": "2019-08-01T00:00:00",
            "time_iso": "2019-08-01T00:00:00",
            "value": 4674
          },
          {
            "time": 1564704000,
            "datetime": "2019-08-02T00:00:00",
            "time_iso": "2019-08-02T00:00:00",
            "value": 4674
          },
          {
            "time": 1564876800,
            "datetime": "2019-08-04T00:00:00",
            "time_iso": "2019-08-04T00:00:00",
            "value": 4675
          },
          {
            "time": 1564963200,
            "datetime": "2019-08-05T00:00:00",
            "time_iso": "2019-08-05T00:00:00",
            "value": 4675
          },
          {
            "time": 1565136000,
            "datetime": "2019-08-07T00:00:00",
            "time_iso": "2019-08-07T00:00:00",
            "value": 4676
          },
          {
            "time": 1565308800,
            "datetime": "2019-08-09T00:00:00",
            "time_iso": "2019-08-09T00:00:00",
            "value": 4676
          },
          {
            "time": 1565481600,
            "datetime": "2019-08-11T00:00:00",
            "time_iso": "2019-08-11T00:00:00",
            "value": 4677
          },
          {
            "time": 1565654400,
            "datetime": "2019-08-13T00:00:00",
            "time_iso": "2019-08-13T00:00:00",
            "value": 4677
          },
          {
            "time": 1565827200,
            "datetime": "2019-08-15T00:00:00",
            "time_iso": "2019-08-15T00:00:00",
            "value": 4676
          },
          {
            "time": 1566000000,
            "datetime": "2019-08-17T00:00:00",
            "time_iso": "2019-08-17T00:00:00",
            "value": 4677
          },
          {
            "time": 1566172800,
            "datetime": "2019-08-19T00:00:00",
            "time_iso": "2019-08-19T00:00:00",
            "value": 4677
          },
          {
            "time": 1566345600,
            "datetime": "2019-08-21T00:00:00",
            "time_iso": "2019-08-21T00:00:00",
            "value": 4677
          },
          {
            "time": 1566518400,
            "datetime": "2019-08-23T00:00:00",
            "time_iso": "2019-08-23T00:00:00",
            "value": 4674
          },
          {
            "time": 1566691200,
            "datetime": "2019-08-25T00:00:00",
            "time_iso": "2019-08-25T00:00:00",
            "value": 4674
          },
          {
            "time": 1566864000,
            "datetime": "2019-08-27T00:00:00",
            "time_iso": "2019-08-27T00:00:00",
            "value": 4674
          },
          {
            "time": 1567036800,
            "datetime": "2019-08-29T00:00:00",
            "time_iso": "2019-08-29T00:00:00",
            "value": 4674
          },
          {
            "time": 1567209600,
            "datetime": "2019-08-31T00:00:00",
            "time_iso": "2019-08-31T00:00:00",
            "value": 4676
          },
          {
            "time": 1567382400,
            "datetime": "2019-09-02T00:00:00",
            "time_iso": "2019-09-02T00:00:00",
            "value": 4679
          },
          {
            "time": 1567555200,
            "datetime": "2019-09-04T00:00:00",
            "time_iso": "2019-09-04T00:00:00",
            "value": 4681
          },
          {
            "time": 1567728000,
            "datetime": "2019-09-06T00:00:00",
            "time_iso": "2019-09-06T00:00:00",
            "value": 4683
          },
          {
            "time": 1567900800,
            "datetime": "2019-09-08T00:00:00",
            "time_iso": "2019-09-08T00:00:00",
            "value": 4684
          },
          {
            "time": 1568073600,
            "datetime": "2019-09-10T00:00:00",
            "time_iso": "2019-09-10T00:00:00",
            "value": 4685
          },
          {
            "time": 1568246400,
            "datetime": "2019-09-12T00:00:00",
            "time_iso": "2019-09-12T00:00:00",
            "value": 4685
          },
          {
            "time": 1568419200,
            "datetime": "2019-09-14T00:00:00",
            "time_iso": "2019-09-14T00:00:00",
            "value": 4687
          },
          {
            "time": 1568592000,
            "datetime": "2019-09-16T00:00:00",
            "time_iso": "2019-09-16T00:00:00",
            "value": 4686
          },
          {
            "time": 1568764800,
            "datetime": "2019-09-18T00:00:00",
            "time_iso": "2019-09-18T00:00:00",
            "value": 4687
          },
          {
            "time": 1568937600,
            "datetime": "2019-09-20T00:00:00",
            "time_iso": "2019-09-20T00:00:00",
            "value": 4686
          },
          {
            "time": 1569110400,
            "datetime": "2019-09-22T00:00:00",
            "time_iso": "2019-09-22T00:00:00",
            "value": 4688
          },
          {
            "time": 1569283200,
            "datetime": "2019-09-24T00:00:00",
            "time_iso": "2019-09-24T00:00:00",
            "value": 4689
          },
          {
            "time": 1569456000,
            "datetime": "2019-09-26T00:00:00",
            "time_iso": "2019-09-26T00:00:00",
            "value": 4706
          },
          {
            "time": 1569628800,
            "datetime": "2019-09-28T00:00:00",
            "time_iso": "2019-09-28T00:00:00",
            "value": 4708
          },
          {
            "time": 1569801600,
            "datetime": "2019-09-30T00:00:00",
            "time_iso": "2019-09-30T00:00:00",
            "value": 4709
          },
          {
            "time": 1569974400,
            "datetime": "2019-10-02T00:00:00",
            "time_iso": "2019-10-02T00:00:00",
            "value": 4711
          },
          {
            "time": 1570147200,
            "datetime": "2019-10-04T00:00:00",
            "time_iso": "2019-10-04T00:00:00",
            "value": 4711
          },
          {
            "time": 1570320000,
            "datetime": "2019-10-06T00:00:00",
            "time_iso": "2019-10-06T00:00:00",
            "value": 4712
          },
          {
            "time": 1570492800,
            "datetime": "2019-10-08T00:00:00",
            "time_iso": "2019-10-08T00:00:00",
            "value": 4714
          },
          {
            "time": 1570665600,
            "datetime": "2019-10-10T00:00:00",
            "time_iso": "2019-10-10T00:00:00",
            "value": 4716
          },
          {
            "time": 1570838400,
            "datetime": "2019-10-12T00:00:00",
            "time_iso": "2019-10-12T00:00:00",
            "value": 4720
          },
          {
            "time": 1571011200,
            "datetime": "2019-10-14T00:00:00",
            "time_iso": "2019-10-14T00:00:00",
            "value": 4720
          },
          {
            "time": 1571184000,
            "datetime": "2019-10-16T00:00:00",
            "time_iso": "2019-10-16T00:00:00",
            "value": 4721
          },
          {
            "time": 1571356800,
            "datetime": "2019-10-18T00:00:00",
            "time_iso": "2019-10-18T00:00:00",
            "value": 4724
          },
          {
            "time": 1571443200,
            "datetime": "2019-10-19T00:00:00",
            "time_iso": "2019-10-19T00:00:00",
            "value": 4727
          },
          {
            "time": 1571616000,
            "datetime": "2019-10-21T00:00:00",
            "time_iso": "2019-10-21T00:00:00",
            "value": 4727
          },
          {
            "time": 1571788800,
            "datetime": "2019-10-23T00:00:00",
            "time_iso": "2019-10-23T00:00:00",
            "value": 4728
          },
          {
            "time": 1571961600,
            "datetime": "2019-10-25T00:00:00",
            "time_iso": "2019-10-25T00:00:00",
            "value": 4729
          },
          {
            "time": 1572134400,
            "datetime": "2019-10-27T00:00:00",
            "time_iso": "2019-10-27T00:00:00",
            "value": 4732
          },
          {
            "time": 1572307200,
            "datetime": "2019-10-29T00:00:00",
            "time_iso": "2019-10-29T00:00:00",
            "value": 4734
          },
          {
            "time": 1572480000,
            "datetime": "2019-10-31T00:00:00",
            "time_iso": "2019-10-31T00:00:00",
            "value": 4735
          },
          {
            "time": 1572652800,
            "datetime": "2019-11-02T00:00:00",
            "time_iso": "2019-11-02T00:00:00",
            "value": 4735
          },
          {
            "time": 1572825600,
            "datetime": "2019-11-04T00:00:00",
            "time_iso": "2019-11-04T00:00:00",
            "value": 4738
          },
          {
            "time": 1572912000,
            "datetime": "2019-11-05T00:00:00",
            "time_iso": "2019-11-05T00:00:00",
            "value": 4740
          },
          {
            "time": 1573084800,
            "datetime": "2019-11-07T00:00:00",
            "time_iso": "2019-11-07T00:00:00",
            "value": 4740
          },
          {
            "time": 1573257600,
            "datetime": "2019-11-09T00:00:00",
            "time_iso": "2019-11-09T00:00:00",
            "value": 4741
          },
          {
            "time": 1573430400,
            "datetime": "2019-11-11T00:00:00",
            "time_iso": "2019-11-11T00:00:00",
            "value": 4743
          },
          {
            "time": 1573603200,
            "datetime": "2019-11-13T00:00:00",
            "time_iso": "2019-11-13T00:00:00",
            "value": 4743
          },
          {
            "time": 1573776000,
            "datetime": "2019-11-15T00:00:00",
            "time_iso": "2019-11-15T00:00:00",
            "value": 4743
          },
          {
            "time": 1573948800,
            "datetime": "2019-11-17T00:00:00",
            "time_iso": "2019-11-17T00:00:00",
            "value": 4744
          },
          {
            "time": 1574121600,
            "datetime": "2019-11-19T00:00:00",
            "time_iso": "2019-11-19T00:00:00",
            "value": 4750
          },
          {
            "time": 1574294400,
            "datetime": "2019-11-21T00:00:00",
            "time_iso": "2019-11-21T00:00:00",
            "value": 4750
          },
          {
            "time": 1574467200,
            "datetime": "2019-11-23T00:00:00",
            "time_iso": "2019-11-23T00:00:00",
            "value": 4752
          },
          {
            "time": 1574640000,
            "datetime": "2019-11-25T00:00:00",
            "time_iso": "2019-11-25T00:00:00",
            "value": 4753
          },
          {
            "time": 1574812800,
            "datetime": "2019-11-27T00:00:00",
            "time_iso": "2019-11-27T00:00:00",
            "value": 4753
          },
          {
            "time": 1574985600,
            "datetime": "2019-11-29T00:00:00",
            "time_iso": "2019-11-29T00:00:00",
            "value": 4755
          },
          {
            "time": 1575158400,
            "datetime": "2019-12-01T00:00:00",
            "time_iso": "2019-12-01T00:00:00",
            "value": 4756
          },
          {
            "time": 1575331200,
            "datetime": "2019-12-03T00:00:00",
            "time_iso": "2019-12-03T00:00:00",
            "value": 4757
          },
          {
            "time": 1575504000,
            "datetime": "2019-12-05T00:00:00",
            "time_iso": "2019-12-05T00:00:00",
            "value": 4759
          },
          {
            "time": 1575676800,
            "datetime": "2019-12-07T00:00:00",
            "time_iso": "2019-12-07T00:00:00",
            "value": 4761
          },
          {
            "time": 1575849600,
            "datetime": "2019-12-09T00:00:00",
            "time_iso": "2019-12-09T00:00:00",
            "value": 4761
          },
          {
            "time": 1576022400,
            "datetime": "2019-12-11T00:00:00",
            "time_iso": "2019-12-11T00:00:00",
            "value": 4762
          },
          {
            "time": 1576195200,
            "datetime": "2019-12-13T00:00:00",
            "time_iso": "2019-12-13T00:00:00",
            "value": 4761
          },
          {
            "time": 1576368000,
            "datetime": "2019-12-15T00:00:00",
            "time_iso": "2019-12-15T00:00:00",
            "value": 4762
          },
          {
            "time": 1576540800,
            "datetime": "2019-12-17T00:00:00",
            "time_iso": "2019-12-17T00:00:00",
            "value": 4763
          },
          {
            "time": 1576713600,
            "datetime": "2019-12-19T00:00:00",
            "time_iso": "2019-12-19T00:00:00",
            "value": 4764
          },
          {
            "time": 1576886400,
            "datetime": "2019-12-21T00:00:00",
            "time_iso": "2019-12-21T00:00:00",
            "value": 4765
          },
          {
            "time": 1577059200,
            "datetime": "2019-12-23T00:00:00",
            "time_iso": "2019-12-23T00:00:00",
            "value": 4767
          },
          {
            "time": 1577232000,
            "datetime": "2019-12-25T00:00:00",
            "time_iso": "2019-12-25T00:00:00",
            "value": 4769
          },
          {
            "time": 1577404800,
            "datetime": "2019-12-27T00:00:00",
            "time_iso": "2019-12-27T00:00:00",
            "value": 4770
          },
          {
            "time": 1577577600,
            "datetime": "2019-12-29T00:00:00",
            "time_iso": "2019-12-29T00:00:00",
            "value": 4770
          },
          {
            "time": 1577750400,
            "datetime": "2019-12-31T00:00:00",
            "time_iso": "2019-12-31T00:00:00",
            "value": 4771
          },
          {
            "time": 1577923200,
            "datetime": "2020-01-02T00:00:00",
            "time_iso": "2020-01-02T00:00:00",
            "value": 4772
          },
          {
            "time": 1578096000,
            "datetime": "2020-01-04T00:00:00",
            "time_iso": "2020-01-04T00:00:00",
            "value": 4772
          },
          {
            "time": 1578268800,
            "datetime": "2020-01-06T00:00:00",
            "time_iso": "2020-01-06T00:00:00",
            "value": 4772
          },
          {
            "time": 1578441600,
            "datetime": "2020-01-08T00:00:00",
            "time_iso": "2020-01-08T00:00:00",
            "value": 4773
          },
          {
            "time": 1578614400,
            "datetime": "2020-01-10T00:00:00",
            "time_iso": "2020-01-10T00:00:00",
            "value": 4774
          },
          {
            "time": 1578787200,
            "datetime": "2020-01-12T00:00:00",
            "time_iso": "2020-01-12T00:00:00",
            "value": 4777
          },
          {
            "time": 1578873600,
            "datetime": "2020-01-13T00:00:00",
            "time_iso": "2020-01-13T00:00:00",
            "value": 4779
          },
          {
            "time": 1579046400,
            "datetime": "2020-01-15T00:00:00",
            "time_iso": "2020-01-15T00:00:00",
            "value": 4779
          },
          {
            "time": 1579219200,
            "datetime": "2020-01-17T00:00:00",
            "time_iso": "2020-01-17T00:00:00",
            "value": 4781
          },
          {
            "time": 1579392000,
            "datetime": "2020-01-19T00:00:00",
            "time_iso": "2020-01-19T00:00:00",
            "value": 4782
          },
          {
            "time": 1579564800,
            "datetime": "2020-01-21T00:00:00",
            "time_iso": "2020-01-21T00:00:00",
            "value": 4783
          },
          {
            "time": 1579737600,
            "datetime": "2020-01-23T00:00:00",
            "time_iso": "2020-01-23T00:00:00",
            "value": 4785
          },
          {
            "time": 1579910400,
            "datetime": "2020-01-25T00:00:00",
            "time_iso": "2020-01-25T00:00:00",
            "value": 4786
          },
          {
            "time": 1580083200,
            "datetime": "2020-01-27T00:00:00",
            "time_iso": "2020-01-27T00:00:00",
            "value": 4788
          },
          {
            "time": 1580256000,
            "datetime": "2020-01-29T00:00:00",
            "time_iso": "2020-01-29T00:00:00",
            "value": 4790
          },
          {
            "time": 1580515200,
            "datetime": "2020-02-01T00:00:00",
            "time_iso": "2020-02-01T00:00:00",
            "value": 4795
          },
          {
            "time": 1580601600,
            "datetime": "2020-02-02T00:00:00",
            "time_iso": "2020-02-02T00:00:00",
            "value": 4793
          },
          {
            "time": 1580774400,
            "datetime": "2020-02-04T00:00:00",
            "time_iso": "2020-02-04T00:00:00",
            "value": 4795
          },
          {
            "time": 1580947200,
            "datetime": "2020-02-06T00:00:00",
            "time_iso": "2020-02-06T00:00:00",
            "value": 4795
          },
          {
            "time": 1581120000,
            "datetime": "2020-02-08T00:00:00",
            "time_iso": "2020-02-08T00:00:00",
            "value": 4799
          },
          {
            "time": 1581292800,
            "datetime": "2020-02-10T00:00:00",
            "time_iso": "2020-02-10T00:00:00",
            "value": 4799
          },
          {
            "time": 1581465600,
            "datetime": "2020-02-12T00:00:00",
            "time_iso": "2020-02-12T00:00:00",
            "value": 4803
          },
          {
            "time": 1581638400,
            "datetime": "2020-02-14T00:00:00",
            "time_iso": "2020-02-14T00:00:00",
            "value": 4810
          },
          {
            "time": 1581811200,
            "datetime": "2020-02-16T00:00:00",
            "time_iso": "2020-02-16T00:00:00",
            "value": 4812
          },
          {
            "time": 1582070400,
            "datetime": "2020-02-19T00:00:00",
            "time_iso": "2020-02-19T00:00:00",
            "value": 4814
          },
          {
            "time": 1582243200,
            "datetime": "2020-02-21T00:00:00",
            "time_iso": "2020-02-21T00:00:00",
            "value": 4815
          },
          {
            "time": 1582416000,
            "datetime": "2020-02-23T00:00:00",
            "time_iso": "2020-02-23T00:00:00",
            "value": 4817
          },
          {
            "time": 1582588800,
            "datetime": "2020-02-25T00:00:00",
            "time_iso": "2020-02-25T00:00:00",
            "value": 4819
          },
          {
            "time": 1582761600,
            "datetime": "2020-02-27T00:00:00",
            "time_iso": "2020-02-27T00:00:00",
            "value": 4819
          },
          {
            "time": 1582934400,
            "datetime": "2020-02-29T00:00:00",
            "time_iso": "2020-02-29T00:00:00",
            "value": 4823
          },
          {
            "time": 1583107200,
            "datetime": "2020-03-02T00:00:00",
            "time_iso": "2020-03-02T00:00:00",
            "value": 4824
          },
          {
            "time": 1583280000,
            "datetime": "2020-03-04T00:00:00",
            "time_iso": "2020-03-04T00:00:00",
            "value": 4824
          },
          {
            "time": 1583452800,
            "datetime": "2020-03-06T00:00:00",
            "time_iso": "2020-03-06T00:00:00",
            "value": 4826
          },
          {
            "time": 1583625600,
            "datetime": "2020-03-08T00:00:00",
            "time_iso": "2020-03-08T00:00:00",
            "value": 4835
          },
          {
            "time": 1583798400,
            "datetime": "2020-03-10T00:00:00",
            "time_iso": "2020-03-10T00:00:00",
            "value": 4836
          },
          {
            "time": 1583971200,
            "datetime": "2020-03-12T00:00:00",
            "time_iso": "2020-03-12T00:00:00",
            "value": 4837
          },
          {
            "time": 1584144000,
            "datetime": "2020-03-14T00:00:00",
            "time_iso": "2020-03-14T00:00:00",
            "value": 4838
          },
          {
            "time": 1584316800,
            "datetime": "2020-03-16T00:00:00",
            "time_iso": "2020-03-16T00:00:00",
            "value": 4838
          },
          {
            "time": 1584489600,
            "datetime": "2020-03-18T00:00:00",
            "time_iso": "2020-03-18T00:00:00",
            "value": 4838
          },
          {
            "time": 1584662400,
            "datetime": "2020-03-20T00:00:00",
            "time_iso": "2020-03-20T00:00:00",
            "value": 4840
          },
          {
            "time": 1584835200,
            "datetime": "2020-03-22T00:00:00",
            "time_iso": "2020-03-22T00:00:00",
            "value": 4839
          },
          {
            "time": 1585008000,
            "datetime": "2020-03-24T00:00:00",
            "time_iso": "2020-03-24T00:00:00",
            "value": 4841
          },
          {
            "time": 1585180800,
            "datetime": "2020-03-26T00:00:00",
            "time_iso": "2020-03-26T00:00:00",
            "value": 4842
          },
          {
            "time": 1585353600,
            "datetime": "2020-03-28T00:00:00",
            "time_iso": "2020-03-28T00:00:00",
            "value": 4844
          },
          {
            "time": 1585526400,
            "datetime": "2020-03-30T00:00:00",
            "time_iso": "2020-03-30T00:00:00",
            "value": 4844
          },
          {
            "time": 1585699200,
            "datetime": "2020-04-01T00:00:00",
            "time_iso": "2020-04-01T00:00:00",
            "value": 4846
          },
          {
            "time": 1585872000,
            "datetime": "2020-04-03T00:00:00",
            "time_iso": "2020-04-03T00:00:00",
            "value": 4847
          },
          {
            "time": 1586044800,
            "datetime": "2020-04-05T00:00:00",
            "time_iso": "2020-04-05T00:00:00",
            "value": 4848
          },
          {
            "time": 1586217600,
            "datetime": "2020-04-07T00:00:00",
            "time_iso": "2020-04-07T00:00:00",
            "value": 4848
          },
          {
            "time": 1586390400,
            "datetime": "2020-04-09T00:00:00",
            "time_iso": "2020-04-09T00:00:00",
            "value": 4849
          },
          {
            "time": 1586563200,
            "datetime": "2020-04-11T00:00:00",
            "time_iso": "2020-04-11T00:00:00",
            "value": 4852
          },
          {
            "time": 1586736000,
            "datetime": "2020-04-13T00:00:00",
            "time_iso": "2020-04-13T00:00:00",
            "value": 4852
          },
          {
            "time": 1586908800,
            "datetime": "2020-04-15T00:00:00",
            "time_iso": "2020-04-15T00:00:00",
            "value": 4854
          },
          {
            "time": 1587081600,
            "datetime": "2020-04-17T00:00:00",
            "time_iso": "2020-04-17T00:00:00",
            "value": 4855
          },
          {
            "time": 1587254400,
            "datetime": "2020-04-19T00:00:00",
            "time_iso": "2020-04-19T00:00:00",
            "value": 4856
          },
          {
            "time": 1587427200,
            "datetime": "2020-04-21T00:00:00",
            "time_iso": "2020-04-21T00:00:00",
            "value": 4861
          },
          {
            "time": 1587600000,
            "datetime": "2020-04-23T00:00:00",
            "time_iso": "2020-04-23T00:00:00",
            "value": 4861
          },
          {
            "time": 1587772800,
            "datetime": "2020-04-25T00:00:00",
            "time_iso": "2020-04-25T00:00:00",
            "value": 4865
          },
          {
            "time": 1587945600,
            "datetime": "2020-04-27T00:00:00",
            "time_iso": "2020-04-27T00:00:00",
            "value": 4864
          },
          {
            "time": 1588118400,
            "datetime": "2020-04-29T00:00:00",
            "time_iso": "2020-04-29T00:00:00",
            "value": 4866
          },
          {
            "time": 1588291200,
            "datetime": "2020-05-01T00:00:00",
            "time_iso": "2020-05-01T00:00:00",
            "value": 4868
          },
          {
            "time": 1588464000,
            "datetime": "2020-05-03T00:00:00",
            "time_iso": "2020-05-03T00:00:00",
            "value": 4868
          },
          {
            "time": 1588636800,
            "datetime": "2020-05-05T00:00:00",
            "time_iso": "2020-05-05T00:00:00",
            "value": 4868
          },
          {
            "time": 1588809600,
            "datetime": "2020-05-07T00:00:00",
            "time_iso": "2020-05-07T00:00:00",
            "value": 4872
          },
          {
            "time": 1588982400,
            "datetime": "2020-05-09T00:00:00",
            "time_iso": "2020-05-09T00:00:00",
            "value": 4874
          },
          {
            "time": 1589155200,
            "datetime": "2020-05-11T00:00:00",
            "time_iso": "2020-05-11T00:00:00",
            "value": 4875
          },
          {
            "time": 1589328000,
            "datetime": "2020-05-13T00:00:00",
            "time_iso": "2020-05-13T00:00:00",
            "value": 4876
          },
          {
            "time": 1589500800,
            "datetime": "2020-05-15T00:00:00",
            "time_iso": "2020-05-15T00:00:00",
            "value": 4877
          },
          {
            "time": 1589673600,
            "datetime": "2020-05-17T00:00:00",
            "time_iso": "2020-05-17T00:00:00",
            "value": 4878
          },
          {
            "time": 1589846400,
            "datetime": "2020-05-19T00:00:00",
            "time_iso": "2020-05-19T00:00:00",
            "value": 4882
          },
          {
            "time": 1590019200,
            "datetime": "2020-05-21T00:00:00",
            "time_iso": "2020-05-21T00:00:00",
            "value": 4883
          },
          {
            "time": 1590192000,
            "datetime": "2020-05-23T00:00:00",
            "time_iso": "2020-05-23T00:00:00",
            "value": 4887
          },
          {
            "time": 1590364800,
            "datetime": "2020-05-25T00:00:00",
            "time_iso": "2020-05-25T00:00:00",
            "value": 4887
          },
          {
            "time": 1590537600,
            "datetime": "2020-05-27T00:00:00",
            "time_iso": "2020-05-27T00:00:00",
            "value": 4889
          },
          {
            "time": 1590710400,
            "datetime": "2020-05-29T00:00:00",
            "time_iso": "2020-05-29T00:00:00",
            "value": 4890
          },
          {
            "time": 1591142400,
            "datetime": "2020-06-03T00:00:00",
            "time_iso": "2020-06-03T00:00:00",
            "value": 4903
          },
          {
            "time": 1591315200,
            "datetime": "2020-06-05T00:00:00",
            "time_iso": "2020-06-05T00:00:00",
            "value": 4905
          },
          {
            "time": 1591660800,
            "datetime": "2020-06-09T00:00:00",
            "time_iso": "2020-06-09T00:00:00",
            "value": 4906
          },
          {
            "time": 1591833600,
            "datetime": "2020-06-11T00:00:00",
            "time_iso": "2020-06-11T00:00:00",
            "value": 4906
          },
          {
            "time": 1592006400,
            "datetime": "2020-06-13T00:00:00",
            "time_iso": "2020-06-13T00:00:00",
            "value": 4907
          },
          {
            "time": 1592265600,
            "datetime": "2020-06-16T00:00:00",
            "time_iso": "2020-06-16T00:00:00",
            "value": 4907
          },
          {
            "time": 1592438400,
            "datetime": "2020-06-18T00:00:00",
            "time_iso": "2020-06-18T00:00:00",
            "value": 4908
          },
          {
            "time": 1593475200,
            "datetime": "2020-06-30T00:00:00",
            "time_iso": "2020-06-30T00:00:00",
            "value": 4916
          },
          {
            "time": 1593648000,
            "datetime": "2020-07-02T00:00:00",
            "time_iso": "2020-07-02T00:00:00",
            "value": 4918
          },
          {
            "time": 1594166400,
            "datetime": "2020-07-08T00:00:00",
            "time_iso": "2020-07-08T00:00:00",
            "value": 4923
          },
          {
            "time": 1594339200,
            "datetime": "2020-07-10T00:00:00",
            "time_iso": "2020-07-10T00:00:00",
            "value": 4923
          },
          {
            "time": 1594512000,
            "datetime": "2020-07-12T00:00:00",
            "time_iso": "2020-07-12T00:00:00",
            "value": 4924
          },
          {
            "time": 1595462400,
            "datetime": "2020-07-23T00:00:00",
            "time_iso": "2020-07-23T00:00:00",
            "value": 4935
          },
          {
            "time": 1595894400,
            "datetime": "2020-07-28T00:00:00",
            "time_iso": "2020-07-28T00:00:00",
            "value": 4944
          },
          {
            "time": 1596067200,
            "datetime": "2020-07-30T00:00:00",
            "time_iso": "2020-07-30T00:00:00",
            "value": 4947
          },
          {
            "time": 1596240000,
            "datetime": "2020-08-01T00:00:00",
            "time_iso": "2020-08-01T00:00:00",
            "value": 4953
          },
          {
            "time": 1596412800,
            "datetime": "2020-08-03T00:00:00",
            "time_iso": "2020-08-03T00:00:00",
            "value": 4960
          },
          {
            "time": 1596585600,
            "datetime": "2020-08-05T00:00:00",
            "time_iso": "2020-08-05T00:00:00",
            "value": 4962
          },
          {
            "time": 1596758400,
            "datetime": "2020-08-07T00:00:00",
            "time_iso": "2020-08-07T00:00:00",
            "value": 4963
          },
          {
            "time": 1596931200,
            "datetime": "2020-08-09T00:00:00",
            "time_iso": "2020-08-09T00:00:00",
            "value": 4964
          },
          {
            "time": 1597104000,
            "datetime": "2020-08-11T00:00:00",
            "time_iso": "2020-08-11T00:00:00",
            "value": 4966
          },
          {
            "time": 1597276800,
            "datetime": "2020-08-13T00:00:00",
            "time_iso": "2020-08-13T00:00:00",
            "value": 4966
          },
          {
            "time": 1597449600,
            "datetime": "2020-08-15T00:00:00",
            "time_iso": "2020-08-15T00:00:00",
            "value": 4968
          },
          {
            "time": 1597622400,
            "datetime": "2020-08-17T00:00:00",
            "time_iso": "2020-08-17T00:00:00",
            "value": 4968
          },
          {
            "time": 1597795200,
            "datetime": "2020-08-19T00:00:00",
            "time_iso": "2020-08-19T00:00:00",
            "value": 4969
          },
          {
            "time": 1597881600,
            "datetime": "2020-08-20T00:00:00",
            "time_iso": "2020-08-20T00:00:00",
            "value": 4969
          },
          {
            "time": 1597968000,
            "datetime": "2020-08-21T00:00:00",
            "time_iso": "2020-08-21T00:00:00",
            "value": 4970
          },
          {
            "time": 1598140800,
            "datetime": "2020-08-23T00:00:00",
            "time_iso": "2020-08-23T00:00:00",
            "value": 4972
          },
          {
            "time": 1599523200,
            "datetime": "2020-09-08T00:00:00",
            "time_iso": "2020-09-08T00:00:00",
            "value": 4978
          },
          {
            "time": 1599696000,
            "datetime": "2020-09-10T00:00:00",
            "time_iso": "2020-09-10T00:00:00",
            "value": 4979
          },
          {
            "time": 1599868800,
            "datetime": "2020-09-12T00:00:00",
            "time_iso": "2020-09-12T00:00:00",
            "value": 4982
          },
          {
            "time": 1600041600,
            "datetime": "2020-09-14T00:00:00",
            "time_iso": "2020-09-14T00:00:00",
            "value": 4982
          },
          {
            "time": 1600214400,
            "datetime": "2020-09-16T00:00:00",
            "time_iso": "2020-09-16T00:00:00",
            "value": 4984
          },
          {
            "time": 1601251200,
            "datetime": "2020-09-28T00:00:00",
            "time_iso": "2020-09-28T00:00:00",
            "value": 4992
          },
          {
            "time": 1601424000,
            "datetime": "2020-09-30T00:00:00",
            "time_iso": "2020-09-30T00:00:00",
            "value": 4995
          },
          {
            "time": 1601596800,
            "datetime": "2020-10-02T00:00:00",
            "time_iso": "2020-10-02T00:00:00",
            "value": 4998
          },
          {
            "time": 1601856000,
            "datetime": "2020-10-05T00:00:00",
            "time_iso": "2020-10-05T00:00:00",
            "value": 5002
          },
          {
            "time": 1602547200,
            "datetime": "2020-10-13T00:00:00",
            "time_iso": "2020-10-13T00:00:00",
            "value": 5005
          },
          {
            "time": 1602720000,
            "datetime": "2020-10-15T00:00:00",
            "time_iso": "2020-10-15T00:00:00",
            "value": 5007
          },
          {
            "time": 1603152000,
            "datetime": "2020-10-20T00:00:00",
            "time_iso": "2020-10-20T00:00:00",
            "value": 5011
          },
          {
            "time": 1604016000,
            "datetime": "2020-10-30T00:00:00",
            "time_iso": "2020-10-30T00:00:00",
            "value": 5020
          },
          {
            "time": 1605052800,
            "datetime": "2020-11-11T00:00:00",
            "time_iso": "2020-11-11T00:00:00",
            "value": 5026
          },
          {
            "time": 1605139200,
            "datetime": "2020-11-12T00:00:00",
            "time_iso": "2020-11-12T00:00:00",
            "value": 5026
          },
          {
            "time": 1605571200,
            "datetime": "2020-11-17T00:00:00",
            "time_iso": "2020-11-17T00:00:00",
            "value": 5043
          },
          {
            "time": 1605830400,
            "datetime": "2020-11-20T00:00:00",
            "time_iso": "2020-11-20T00:00:00",
            "value": 5045
          },
          {
            "time": 1606089600,
            "datetime": "2020-11-23T00:00:00",
            "time_iso": "2020-11-23T00:00:00",
            "value": 5050
          },
          {
            "time": 1606176000,
            "datetime": "2020-11-24T00:00:00",
            "time_iso": "2020-11-24T00:00:00",
            "value": 5050
          },
          {
            "time": 1606348800,
            "datetime": "2020-11-26T00:00:00",
            "time_iso": "2020-11-26T00:00:00",
            "value": 5051
          },
          {
            "time": 1606521600,
            "datetime": "2020-11-28T00:00:00",
            "time_iso": "2020-11-28T00:00:00",
            "value": 5053
          },
          {
            "time": 1606694400,
            "datetime": "2020-11-30T00:00:00",
            "time_iso": "2020-11-30T00:00:00",
            "value": 5053
          },
          {
            "time": 1606780800,
            "datetime": "2020-12-01T00:00:00",
            "time_iso": "2020-12-01T00:00:00",
            "value": 5053
          },
          {
            "time": 1607126400,
            "datetime": "2020-12-05T00:00:00",
            "time_iso": "2020-12-05T00:00:00",
            "value": 5056
          },
          {
            "time": 1610928000,
            "datetime": "2021-01-18T00:00:00",
            "time_iso": "2021-01-18T00:00:00",
            "value": 5094
          },
          {
            "time": 1611014400,
            "datetime": "2021-01-19T00:00:00",
            "time_iso": "2021-01-19T00:00:00",
            "value": 5094
          },
          {
            "time": 1611100800,
            "datetime": "2021-01-20T00:00:00",
            "time_iso": "2021-01-20T00:00:00",
            "value": 5094
          },
          {
            "time": 1611273600,
            "datetime": "2021-01-22T00:00:00",
            "time_iso": "2021-01-22T00:00:00",
            "value": 5094
          },
          {
            "time": 1611446400,
            "datetime": "2021-01-24T00:00:00",
            "time_iso": "2021-01-24T00:00:00",
            "value": 5095
          },
          {
            "time": 1611619200,
            "datetime": "2021-01-26T00:00:00",
            "time_iso": "2021-01-26T00:00:00",
            "value": 5095
          },
          {
            "time": 1611792000,
            "datetime": "2021-01-28T00:00:00",
            "time_iso": "2021-01-28T00:00:00",
            "value": 5098
          },
          {
            "time": 1611964800,
            "datetime": "2021-01-30T00:00:00",
            "time_iso": "2021-01-30T00:00:00",
            "value": 5102
          },
          {
            "time": 1612137600,
            "datetime": "2021-02-01T00:00:00",
            "time_iso": "2021-02-01T00:00:00",
            "value": 5103
          },
          {
            "time": 1612310400,
            "datetime": "2021-02-03T00:00:00",
            "time_iso": "2021-02-03T00:00:00",
            "value": 5104
          },
          {
            "time": 1612483200,
            "datetime": "2021-02-05T00:00:00",
            "time_iso": "2021-02-05T00:00:00",
            "value": 5106
          },
          {
            "time": 1612569600,
            "datetime": "2021-02-06T00:00:00",
            "time_iso": "2021-02-06T00:00:00",
            "value": 5107
          },
          {
            "time": 1612742400,
            "datetime": "2021-02-08T00:00:00",
            "time_iso": "2021-02-08T00:00:00",
            "value": 5109
          },
          {
            "time": 1612915200,
            "datetime": "2021-02-10T00:00:00",
            "time_iso": "2021-02-10T00:00:00",
            "value": 5110
          },
          {
            "time": 1613347200,
            "datetime": "2021-02-15T00:00:00",
            "time_iso": "2021-02-15T00:00:00",
            "value": 5111
          },
          {
            "time": 1613520000,
            "datetime": "2021-02-17T00:00:00",
            "time_iso": "2021-02-17T00:00:00",
            "value": 5114
          },
          {
            "time": 1613692800,
            "datetime": "2021-02-19T00:00:00",
            "time_iso": "2021-02-19T00:00:00",
            "value": 5118
          },
          {
            "time": 1613865600,
            "datetime": "2021-02-21T00:00:00",
            "time_iso": "2021-02-21T00:00:00",
            "value": 5123
          },
          {
            "time": 1614038400,
            "datetime": "2021-02-23T00:00:00",
            "time_iso": "2021-02-23T00:00:00",
            "value": 5127
          },
          {
            "time": 1614211200,
            "datetime": "2021-02-25T00:00:00",
            "time_iso": "2021-02-25T00:00:00",
            "value": 5129
          },
          {
            "time": 1614384000,
            "datetime": "2021-02-27T00:00:00",
            "time_iso": "2021-02-27T00:00:00",
            "value": 5132
          },
          {
            "time": 1614556800,
            "datetime": "2021-03-01T00:00:00",
            "time_iso": "2021-03-01T00:00:00",
            "value": 5136
          },
          {
            "time": 1614729600,
            "datetime": "2021-03-03T00:00:00",
            "time_iso": "2021-03-03T00:00:00",
            "value": 5139
          },
          {
            "time": 1614902400,
            "datetime": "2021-03-05T00:00:00",
            "time_iso": "2021-03-05T00:00:00",
            "value": 5139
          },
          {
            "time": 1615075200,
            "datetime": "2021-03-07T00:00:00",
            "time_iso": "2021-03-07T00:00:00",
            "value": 5141
          },
          {
            "time": 1615248000,
            "datetime": "2021-03-09T00:00:00",
            "time_iso": "2021-03-09T00:00:00",
            "value": 5141
          },
          {
            "time": 1615420800,
            "datetime": "2021-03-11T00:00:00",
            "time_iso": "2021-03-11T00:00:00",
            "value": 5141
          },
          {
            "time": 1615593600,
            "datetime": "2021-03-13T00:00:00",
            "time_iso": "2021-03-13T00:00:00",
            "value": 5143
          },
          {
            "time": 1615766400,
            "datetime": "2021-03-15T00:00:00",
            "time_iso": "2021-03-15T00:00:00",
            "value": 5144
          },
          {
            "time": 1615939200,
            "datetime": "2021-03-17T00:00:00",
            "time_iso": "2021-03-17T00:00:00",
            "value": 5145
          },
          {
            "time": 1616112000,
            "datetime": "2021-03-19T00:00:00",
            "time_iso": "2021-03-19T00:00:00",
            "value": 5148
          },
          {
            "time": 1616284800,
            "datetime": "2021-03-21T00:00:00",
            "time_iso": "2021-03-21T00:00:00",
            "value": 5151
          },
          {
            "time": 1616457600,
            "datetime": "2021-03-23T00:00:00",
            "time_iso": "2021-03-23T00:00:00",
            "value": 5151
          },
          {
            "time": 1616630400,
            "datetime": "2021-03-25T00:00:00",
            "time_iso": "2021-03-25T00:00:00",
            "value": 5152
          },
          {
            "time": 1616803200,
            "datetime": "2021-03-27T00:00:00",
            "time_iso": "2021-03-27T00:00:00",
            "value": 5154
          },
          {
            "time": 1616976000,
            "datetime": "2021-03-29T00:00:00",
            "time_iso": "2021-03-29T00:00:00",
            "value": 5154
          },
          {
            "time": 1617148800,
            "datetime": "2021-03-31T00:00:00",
            "time_iso": "2021-03-31T00:00:00",
            "value": 5154
          },
          {
            "time": 1617321600,
            "datetime": "2021-04-02T00:00:00",
            "time_iso": "2021-04-02T00:00:00",
            "value": 5155
          },
          {
            "time": 1617494400,
            "datetime": "2021-04-04T00:00:00",
            "time_iso": "2021-04-04T00:00:00",
            "value": 5156
          },
          {
            "time": 1617667200,
            "datetime": "2021-04-06T00:00:00",
            "time_iso": "2021-04-06T00:00:00",
            "value": 5158
          },
          {
            "time": 1617840000,
            "datetime": "2021-04-08T00:00:00",
            "time_iso": "2021-04-08T00:00:00",
            "value": 5160
          },
          {
            "time": 1618012800,
            "datetime": "2021-04-10T00:00:00",
            "time_iso": "2021-04-10T00:00:00",
            "value": 5165
          },
          {
            "time": 1618185600,
            "datetime": "2021-04-12T00:00:00",
            "time_iso": "2021-04-12T00:00:00",
            "value": 5165
          },
          {
            "time": 1618358400,
            "datetime": "2021-04-14T00:00:00",
            "time_iso": "2021-04-14T00:00:00",
            "value": 5167
          },
          {
            "time": 1618531200,
            "datetime": "2021-04-16T00:00:00",
            "time_iso": "2021-04-16T00:00:00",
            "value": 5168
          },
          {
            "time": 1618704000,
            "datetime": "2021-04-18T00:00:00",
            "time_iso": "2021-04-18T00:00:00",
            "value": 5173
          },
          {
            "time": 1618876800,
            "datetime": "2021-04-20T00:00:00",
            "time_iso": "2021-04-20T00:00:00",
            "value": 5176
          },
          {
            "time": 1619049600,
            "datetime": "2021-04-22T00:00:00",
            "time_iso": "2021-04-22T00:00:00",
            "value": 5179
          },
          {
            "time": 1619222400,
            "datetime": "2021-04-24T00:00:00",
            "time_iso": "2021-04-24T00:00:00",
            "value": 5192
          },
          {
            "time": 1619395200,
            "datetime": "2021-04-26T00:00:00",
            "time_iso": "2021-04-26T00:00:00",
            "value": 5193
          },
          {
            "time": 1619568000,
            "datetime": "2021-04-28T00:00:00",
            "time_iso": "2021-04-28T00:00:00",
            "value": 5195
          },
          {
            "time": 1619740800,
            "datetime": "2021-04-30T00:00:00",
            "time_iso": "2021-04-30T00:00:00",
            "value": 5197
          },
          {
            "time": 1619913600,
            "datetime": "2021-05-02T00:00:00",
            "time_iso": "2021-05-02T00:00:00",
            "value": 5203
          },
          {
            "time": 1620086400,
            "datetime": "2021-05-04T00:00:00",
            "time_iso": "2021-05-04T00:00:00",
            "value": 5204
          },
          {
            "time": 1620259200,
            "datetime": "2021-05-06T00:00:00",
            "time_iso": "2021-05-06T00:00:00",
            "value": 5210
          },
          {
            "time": 1620432000,
            "datetime": "2021-05-08T00:00:00",
            "time_iso": "2021-05-08T00:00:00",
            "value": 5212
          },
          {
            "time": 1620604800,
            "datetime": "2021-05-10T00:00:00",
            "time_iso": "2021-05-10T00:00:00",
            "value": 5212
          },
          {
            "time": 1620777600,
            "datetime": "2021-05-12T00:00:00",
            "time_iso": "2021-05-12T00:00:00",
            "value": 5213
          },
          {
            "time": 1620864000,
            "datetime": "2021-05-13T00:00:00",
            "time_iso": "2021-05-13T00:00:00",
            "value": 5213
          },
          {
            "time": 1621036800,
            "datetime": "2021-05-15T00:00:00",
            "time_iso": "2021-05-15T00:00:00",
            "value": 5213
          },
          {
            "time": 1621209600,
            "datetime": "2021-05-17T00:00:00",
            "time_iso": "2021-05-17T00:00:00",
            "value": 5214
          },
          {
            "time": 1621382400,
            "datetime": "2021-05-19T00:00:00",
            "time_iso": "2021-05-19T00:00:00",
            "value": 5214
          },
          {
            "time": 1621555200,
            "datetime": "2021-05-21T00:00:00",
            "time_iso": "2021-05-21T00:00:00",
            "value": 5215
          },
          {
            "time": 1621728000,
            "datetime": "2021-05-23T00:00:00",
            "time_iso": "2021-05-23T00:00:00",
            "value": 5218
          },
          {
            "time": 1621900800,
            "datetime": "2021-05-25T00:00:00",
            "time_iso": "2021-05-25T00:00:00",
            "value": 5218
          },
          {
            "time": 1622073600,
            "datetime": "2021-05-27T00:00:00",
            "time_iso": "2021-05-27T00:00:00",
            "value": 5218
          },
          {
            "time": 1622678400,
            "datetime": "2021-06-03T00:00:00",
            "time_iso": "2021-06-03T00:00:00",
            "value": 5222
          },
          {
            "time": 1622851200,
            "datetime": "2021-06-05T00:00:00",
            "time_iso": "2021-06-05T00:00:00",
            "value": 5226
          },
          {
            "time": 1623542400,
            "datetime": "2021-06-13T00:00:00",
            "time_iso": "2021-06-13T00:00:00",
            "value": 5230
          },
          {
            "time": 1623715200,
            "datetime": "2021-06-15T00:00:00",
            "time_iso": "2021-06-15T00:00:00",
            "value": 5230
          },
          {
            "time": 1624233600,
            "datetime": "2021-06-21T00:00:00",
            "time_iso": "2021-06-21T00:00:00",
            "value": 5236
          },
          {
            "time": 1624406400,
            "datetime": "2021-06-23T00:00:00",
            "time_iso": "2021-06-23T00:00:00",
            "value": 5237
          },
          {
            "time": 1624579200,
            "datetime": "2021-06-25T00:00:00",
            "time_iso": "2021-06-25T00:00:00",
            "value": 5238
          },
          {
            "time": 1624752000,
            "datetime": "2021-06-27T00:00:00",
            "time_iso": "2021-06-27T00:00:00",
            "value": 5240
          },
          {
            "time": 1625097600,
            "datetime": "2021-07-01T00:00:00",
            "time_iso": "2021-07-01T00:00:00",
            "value": 5242
          },
          {
            "time": 1625788800,
            "datetime": "2021-07-09T00:00:00",
            "time_iso": "2021-07-09T00:00:00",
            "value": 5245
          },
          {
            "time": 1626134400,
            "datetime": "2021-07-13T00:00:00",
            "time_iso": "2021-07-13T00:00:00",
            "value": 5248
          },
          {
            "time": 1626220800,
            "datetime": "2021-07-14T00:00:00",
            "time_iso": "2021-07-14T00:00:00",
            "value": 5248
          },
          {
            "time": 1626307200,
            "datetime": "2021-07-15T00:00:00",
            "time_iso": "2021-07-15T00:00:00",
            "value": 5250
          },
          {
            "time": 1626393600,
            "datetime": "2021-07-16T00:00:00",
            "time_iso": "2021-07-16T00:00:00",
            "value": 5250
          },
          {
            "time": 1626480000,
            "datetime": "2021-07-17T00:00:00",
            "time_iso": "2021-07-17T00:00:00",
            "value": 5251
          },
          {
            "time": 1626566400,
            "datetime": "2021-07-18T00:00:00",
            "time_iso": "2021-07-18T00:00:00",
            "value": 5252
          },
          {
            "time": 1626652800,
            "datetime": "2021-07-19T00:00:00",
            "time_iso": "2021-07-19T00:00:00",
            "value": 5252
          },
          {
            "time": 1626739200,
            "datetime": "2021-07-20T00:00:00",
            "time_iso": "2021-07-20T00:00:00",
            "value": 5252
          },
          {
            "time": 1626825600,
            "datetime": "2021-07-21T00:00:00",
            "time_iso": "2021-07-21T00:00:00",
            "value": 5254
          },
          {
            "time": 1626912000,
            "datetime": "2021-07-22T00:00:00",
            "time_iso": "2021-07-22T00:00:00",
            "value": 5254
          },
          {
            "time": 1626998400,
            "datetime": "2021-07-23T00:00:00",
            "time_iso": "2021-07-23T00:00:00",
            "value": 5255
          },
          {
            "time": 1627171200,
            "datetime": "2021-07-25T00:00:00",
            "time_iso": "2021-07-25T00:00:00",
            "value": 5255
          },
          {
            "time": 1627516800,
            "datetime": "2021-07-29T00:00:00",
            "time_iso": "2021-07-29T00:00:00",
            "value": 5258
          },
          {
            "time": 1627603200,
            "datetime": "2021-07-30T00:00:00",
            "time_iso": "2021-07-30T00:00:00",
            "value": 5260
          },
          {
            "time": 1627689600,
            "datetime": "2021-07-31T00:00:00",
            "time_iso": "2021-07-31T00:00:00",
            "value": 5260
          },
          {
            "time": 1627776000,
            "datetime": "2021-08-01T00:00:00",
            "time_iso": "2021-08-01T00:00:00",
            "value": 5260
          },
          {
            "time": 1627862400,
            "datetime": "2021-08-02T00:00:00",
            "time_iso": "2021-08-02T00:00:00",
            "value": 5260
          },
          {
            "time": 1627948800,
            "datetime": "2021-08-03T00:00:00",
            "time_iso": "2021-08-03T00:00:00",
            "value": 5260
          },
          {
            "time": 1628035200,
            "datetime": "2021-08-04T00:00:00",
            "time_iso": "2021-08-04T00:00:00",
            "value": 5260
          },
          {
            "time": 1628121600,
            "datetime": "2021-08-05T00:00:00",
            "time_iso": "2021-08-05T00:00:00",
            "value": 5260
          },
          {
            "time": 1628208000,
            "datetime": "2021-08-06T00:00:00",
            "time_iso": "2021-08-06T00:00:00",
            "value": 5260
          },
          {
            "time": 1628380800,
            "datetime": "2021-08-08T00:00:00",
            "time_iso": "2021-08-08T00:00:00",
            "value": 5262
          },
          {
            "time": 1628553600,
            "datetime": "2021-08-10T00:00:00",
            "time_iso": "2021-08-10T00:00:00",
            "value": 5262
          },
          {
            "time": 1628640000,
            "datetime": "2021-08-11T00:00:00",
            "time_iso": "2021-08-11T00:00:00",
            "value": 5263
          },
          {
            "time": 1628726400,
            "datetime": "2021-08-12T00:00:00",
            "time_iso": "2021-08-12T00:00:00",
            "value": 5264
          },
          {
            "time": 1628899200,
            "datetime": "2021-08-14T00:00:00",
            "time_iso": "2021-08-14T00:00:00",
            "value": 5265
          },
          {
            "time": 1629072000,
            "datetime": "2021-08-16T00:00:00",
            "time_iso": "2021-08-16T00:00:00",
            "value": 5266
          },
          {
            "time": 1629158400,
            "datetime": "2021-08-17T00:00:00",
            "time_iso": "2021-08-17T00:00:00",
            "value": 5266
          },
          {
            "time": 1629244800,
            "datetime": "2021-08-18T00:00:00",
            "time_iso": "2021-08-18T00:00:00",
            "value": 5267
          },
          {
            "time": 1629417600,
            "datetime": "2021-08-20T00:00:00",
            "time_iso": "2021-08-20T00:00:00",
            "value": 5267
          },
          {
            "time": 1629590400,
            "datetime": "2021-08-22T00:00:00",
            "time_iso": "2021-08-22T00:00:00",
            "value": 5268
          },
          {
            "time": 1629763200,
            "datetime": "2021-08-24T00:00:00",
            "time_iso": "2021-08-24T00:00:00",
            "value": 5268
          },
          {
            "time": 1629936000,
            "datetime": "2021-08-26T00:00:00",
            "time_iso": "2021-08-26T00:00:00",
            "value": 5270
          },
          {
            "time": 1630022400,
            "datetime": "2021-08-27T00:00:00",
            "time_iso": "2021-08-27T00:00:00",
            "value": 5270
          },
          {
            "time": 1630195200,
            "datetime": "2021-08-29T00:00:00",
            "time_iso": "2021-08-29T00:00:00",
            "value": 5274
          },
          {
            "time": 1630368000,
            "datetime": "2021-08-31T00:00:00",
            "time_iso": "2021-08-31T00:00:00",
            "value": 5274
          },
          {
            "time": 1630540800,
            "datetime": "2021-09-02T00:00:00",
            "time_iso": "2021-09-02T00:00:00",
            "value": 5276
          },
          {
            "time": 1630713600,
            "datetime": "2021-09-04T00:00:00",
            "time_iso": "2021-09-04T00:00:00",
            "value": 5277
          },
          {
            "time": 1630886400,
            "datetime": "2021-09-06T00:00:00",
            "time_iso": "2021-09-06T00:00:00",
            "value": 5277
          },
          {
            "time": 1631059200,
            "datetime": "2021-09-08T00:00:00",
            "time_iso": "2021-09-08T00:00:00",
            "value": 5277
          },
          {
            "time": 1631232000,
            "datetime": "2021-09-10T00:00:00",
            "time_iso": "2021-09-10T00:00:00",
            "value": 5279
          },
          {
            "time": 1631404800,
            "datetime": "2021-09-12T00:00:00",
            "time_iso": "2021-09-12T00:00:00",
            "value": 5281
          },
          {
            "time": 1631577600,
            "datetime": "2021-09-14T00:00:00",
            "time_iso": "2021-09-14T00:00:00",
            "value": 5282
          },
          {
            "time": 1631750400,
            "datetime": "2021-09-16T00:00:00",
            "time_iso": "2021-09-16T00:00:00",
            "value": 5283
          },
          {
            "time": 1631923200,
            "datetime": "2021-09-18T00:00:00",
            "time_iso": "2021-09-18T00:00:00",
            "value": 5284
          },
          {
            "time": 1632096000,
            "datetime": "2021-09-20T00:00:00",
            "time_iso": "2021-09-20T00:00:00",
            "value": 5284
          },
          {
            "time": 1632441600,
            "datetime": "2021-09-24T00:00:00",
            "time_iso": "2021-09-24T00:00:00",
            "value": 5287
          },
          {
            "time": 1632787200,
            "datetime": "2021-09-28T00:00:00",
            "time_iso": "2021-09-28T00:00:00",
            "value": 5290
          },
          {
            "time": 1632960000,
            "datetime": "2021-09-30T00:00:00",
            "time_iso": "2021-09-30T00:00:00",
            "value": 5292
          },
          {
            "time": 1633219200,
            "datetime": "2021-10-03T00:00:00",
            "time_iso": "2021-10-03T00:00:00",
            "value": 5293
          },
          {
            "time": 1633392000,
            "datetime": "2021-10-05T00:00:00",
            "time_iso": "2021-10-05T00:00:00",
            "value": 5293
          },
          {
            "time": 1633651200,
            "datetime": "2021-10-08T00:00:00",
            "time_iso": "2021-10-08T00:00:00",
            "value": 5296
          },
          {
            "time": 1633824000,
            "datetime": "2021-10-10T00:00:00",
            "time_iso": "2021-10-10T00:00:00",
            "value": 5298
          },
          {
            "time": 1633996800,
            "datetime": "2021-10-12T00:00:00",
            "time_iso": "2021-10-12T00:00:00",
            "value": 5298
          },
          {
            "time": 1634169600,
            "datetime": "2021-10-14T00:00:00",
            "time_iso": "2021-10-14T00:00:00",
            "value": 5299
          },
          {
            "time": 1634342400,
            "datetime": "2021-10-16T00:00:00",
            "time_iso": "2021-10-16T00:00:00",
            "value": 5301
          },
          {
            "time": 1634515200,
            "datetime": "2021-10-18T00:00:00",
            "time_iso": "2021-10-18T00:00:00",
            "value": 5303
          },
          {
            "time": 1634688000,
            "datetime": "2021-10-20T00:00:00",
            "time_iso": "2021-10-20T00:00:00",
            "value": 5303
          },
          {
            "time": 1634860800,
            "datetime": "2021-10-22T00:00:00",
            "time_iso": "2021-10-22T00:00:00",
            "value": 5305
          },
          {
            "time": 1635033600,
            "datetime": "2021-10-24T00:00:00",
            "time_iso": "2021-10-24T00:00:00",
            "value": 5306
          },
          {
            "time": 1635206400,
            "datetime": "2021-10-26T00:00:00",
            "time_iso": "2021-10-26T00:00:00",
            "value": 5313
          },
          {
            "time": 1635379200,
            "datetime": "2021-10-28T00:00:00",
            "time_iso": "2021-10-28T00:00:00",
            "value": 5314
          },
          {
            "time": 1635552000,
            "datetime": "2021-10-30T00:00:00",
            "time_iso": "2021-10-30T00:00:00",
            "value": 5315
          },
          {
            "time": 1635724800,
            "datetime": "2021-11-01T00:00:00",
            "time_iso": "2021-11-01T00:00:00",
            "value": 5315
          },
          {
            "time": 1635897600,
            "datetime": "2021-11-03T00:00:00",
            "time_iso": "2021-11-03T00:00:00",
            "value": 5317
          },
          {
            "time": 1636070400,
            "datetime": "2021-11-05T00:00:00",
            "time_iso": "2021-11-05T00:00:00",
            "value": 5318
          },
          {
            "time": 1636243200,
            "datetime": "2021-11-07T00:00:00",
            "time_iso": "2021-11-07T00:00:00",
            "value": 5321
          },
          {
            "time": 1636416000,
            "datetime": "2021-11-09T00:00:00",
            "time_iso": "2021-11-09T00:00:00",
            "value": 5324
          },
          {
            "time": 1636588800,
            "datetime": "2021-11-11T00:00:00",
            "time_iso": "2021-11-11T00:00:00",
            "value": 5328
          },
          {
            "time": 1636761600,
            "datetime": "2021-11-13T00:00:00",
            "time_iso": "2021-11-13T00:00:00",
            "value": 5331
          },
          {
            "time": 1636934400,
            "datetime": "2021-11-15T00:00:00",
            "time_iso": "2021-11-15T00:00:00",
            "value": 5331
          },
          {
            "time": 1637107200,
            "datetime": "2021-11-17T00:00:00",
            "time_iso": "2021-11-17T00:00:00",
            "value": 5333
          },
          {
            "time": 1637280000,
            "datetime": "2021-11-19T00:00:00",
            "time_iso": "2021-11-19T00:00:00",
            "value": 5335
          },
          {
            "time": 1637452800,
            "datetime": "2021-11-21T00:00:00",
            "time_iso": "2021-11-21T00:00:00",
            "value": 5336
          },
          {
            "time": 1637625600,
            "datetime": "2021-11-23T00:00:00",
            "time_iso": "2021-11-23T00:00:00",
            "value": 5336
          },
          {
            "time": 1637798400,
            "datetime": "2021-11-25T00:00:00",
            "time_iso": "2021-11-25T00:00:00",
            "value": 5339
          },
          {
            "time": 1637971200,
            "datetime": "2021-11-27T00:00:00",
            "time_iso": "2021-11-27T00:00:00",
            "value": 5341
          },
          {
            "time": 1638144000,
            "datetime": "2021-11-29T00:00:00",
            "time_iso": "2021-11-29T00:00:00",
            "value": 5341
          },
          {
            "time": 1638316800,
            "datetime": "2021-12-01T00:00:00",
            "time_iso": "2021-12-01T00:00:00",
            "value": 5341
          },
          {
            "time": 1638489600,
            "datetime": "2021-12-03T00:00:00",
            "time_iso": "2021-12-03T00:00:00",
            "value": 5344
          },
          {
            "time": 1638662400,
            "datetime": "2021-12-05T00:00:00",
            "time_iso": "2021-12-05T00:00:00",
            "value": 5348
          },
          {
            "time": 1638835200,
            "datetime": "2021-12-07T00:00:00",
            "time_iso": "2021-12-07T00:00:00",
            "value": 5350
          },
          {
            "time": 1639008000,
            "datetime": "2021-12-09T00:00:00",
            "time_iso": "2021-12-09T00:00:00",
            "value": 5354
          },
          {
            "time": 1639180800,
            "datetime": "2021-12-11T00:00:00",
            "time_iso": "2021-12-11T00:00:00",
            "value": 5355
          },
          {
            "time": 1639353600,
            "datetime": "2021-12-13T00:00:00",
            "time_iso": "2021-12-13T00:00:00",
            "value": 5355
          },
          {
            "time": 1639526400,
            "datetime": "2021-12-15T00:00:00",
            "time_iso": "2021-12-15T00:00:00",
            "value": 5355
          },
          {
            "time": 1639699200,
            "datetime": "2021-12-17T00:00:00",
            "time_iso": "2021-12-17T00:00:00",
            "value": 5356
          },
          {
            "time": 1639872000,
            "datetime": "2021-12-19T00:00:00",
            "time_iso": "2021-12-19T00:00:00",
            "value": 5356
          },
          {
            "time": 1640217600,
            "datetime": "2021-12-23T00:00:00",
            "time_iso": "2021-12-23T00:00:00",
            "value": 5362
          },
          {
            "time": 1640390400,
            "datetime": "2021-12-25T00:00:00",
            "time_iso": "2021-12-25T00:00:00",
            "value": 5362
          },
          {
            "time": 1640563200,
            "datetime": "2021-12-27T00:00:00",
            "time_iso": "2021-12-27T00:00:00",
            "value": 5363
          },
          {
            "time": 1640736000,
            "datetime": "2021-12-29T00:00:00",
            "time_iso": "2021-12-29T00:00:00",
            "value": 5363
          },
          {
            "time": 1640908800,
            "datetime": "2021-12-31T00:00:00",
            "time_iso": "2021-12-31T00:00:00",
            "value": 5364
          },
          {
            "time": 1641081600,
            "datetime": "2022-01-02T00:00:00",
            "time_iso": "2022-01-02T00:00:00",
            "value": 5365
          },
          {
            "time": 1641254400,
            "datetime": "2022-01-04T00:00:00",
            "time_iso": "2022-01-04T00:00:00",
            "value": 5366
          },
          {
            "time": 1641427200,
            "datetime": "2022-01-06T00:00:00",
            "time_iso": "2022-01-06T00:00:00",
            "value": 5368
          },
          {
            "time": 1641600000,
            "datetime": "2022-01-08T00:00:00",
            "time_iso": "2022-01-08T00:00:00",
            "value": 5369
          },
          {
            "time": 1641772800,
            "datetime": "2022-01-10T00:00:00",
            "time_iso": "2022-01-10T00:00:00",
            "value": 5371
          },
          {
            "time": 1641945600,
            "datetime": "2022-01-12T00:00:00",
            "time_iso": "2022-01-12T00:00:00",
            "value": 5372
          },
          {
            "time": 1642032000,
            "datetime": "2022-01-13T00:00:00",
            "time_iso": "2022-01-13T00:00:00",
            "value": 5372
          },
          {
            "time": 1644019200,
            "datetime": "2022-02-05T00:00:00",
            "time_iso": "2022-02-05T00:00:00",
            "value": 5380
          },
          {
            "time": 1644278400,
            "datetime": "2022-02-08T00:00:00",
            "time_iso": "2022-02-08T00:00:00",
            "value": 5380
          },
          {
            "time": 1644451200,
            "datetime": "2022-02-10T00:00:00",
            "time_iso": "2022-02-10T00:00:00",
            "value": 5380
          },
          {
            "time": 1644624000,
            "datetime": "2022-02-12T00:00:00",
            "time_iso": "2022-02-12T00:00:00",
            "value": 5381
          },
          {
            "time": 1644796800,
            "datetime": "2022-02-14T00:00:00",
            "time_iso": "2022-02-14T00:00:00",
            "value": 5381
          },
          {
            "time": 1644969600,
            "datetime": "2022-02-16T00:00:00",
            "time_iso": "2022-02-16T00:00:00",
            "value": 5381
          },
          {
            "time": 1645228800,
            "datetime": "2022-02-19T00:00:00",
            "time_iso": "2022-02-19T00:00:00",
            "value": 5381
          },
          {
            "time": 1645315200,
            "datetime": "2022-02-20T00:00:00",
            "time_iso": "2022-02-20T00:00:00",
            "value": 5382
          },
          {
            "time": 1645401600,
            "datetime": "2022-02-21T00:00:00",
            "time_iso": "2022-02-21T00:00:00",
            "value": 5382
          },
          {
            "time": 1645574400,
            "datetime": "2022-02-23T00:00:00",
            "time_iso": "2022-02-23T00:00:00",
            "value": 5382
          },
          {
            "time": 1645747200,
            "datetime": "2022-02-25T00:00:00",
            "time_iso": "2022-02-25T00:00:00",
            "value": 5382
          },
          {
            "time": 1646006400,
            "datetime": "2022-02-28T00:00:00",
            "time_iso": "2022-02-28T00:00:00",
            "value": 5383
          },
          {
            "time": 1646265600,
            "datetime": "2022-03-03T00:00:00",
            "time_iso": "2022-03-03T00:00:00",
            "value": 5385
          },
          {
            "time": 1646524800,
            "datetime": "2022-03-06T00:00:00",
            "time_iso": "2022-03-06T00:00:00",
            "value": 5386
          },
          {
            "time": 1646784000,
            "datetime": "2022-03-09T00:00:00",
            "time_iso": "2022-03-09T00:00:00",
            "value": 5386
          },
          {
            "time": 1647043200,
            "datetime": "2022-03-12T00:00:00",
            "time_iso": "2022-03-12T00:00:00",
            "value": 5388
          },
          {
            "time": 1647302400,
            "datetime": "2022-03-15T00:00:00",
            "time_iso": "2022-03-15T00:00:00",
            "value": 5390
          },
          {
            "time": 1647561600,
            "datetime": "2022-03-18T00:00:00",
            "time_iso": "2022-03-18T00:00:00",
            "value": 5393
          },
          {
            "time": 1647734400,
            "datetime": "2022-03-20T00:00:00",
            "time_iso": "2022-03-20T00:00:00",
            "value": 5394
          },
          {
            "time": 1647993600,
            "datetime": "2022-03-23T00:00:00",
            "time_iso": "2022-03-23T00:00:00",
            "value": 5397
          },
          {
            "time": 1648252800,
            "datetime": "2022-03-26T00:00:00",
            "time_iso": "2022-03-26T00:00:00",
            "value": 5400
          },
          {
            "time": 1648512000,
            "datetime": "2022-03-29T00:00:00",
            "time_iso": "2022-03-29T00:00:00",
            "value": 5403
          },
          {
            "time": 1648598400,
            "datetime": "2022-03-30T00:00:00",
            "time_iso": "2022-03-30T00:00:00",
            "value": 5404
          },
          {
            "time": 1648857600,
            "datetime": "2022-04-02T00:00:00",
            "time_iso": "2022-04-02T00:00:00",
            "value": 5406
          },
          {
            "time": 1649030400,
            "datetime": "2022-04-04T00:00:00",
            "time_iso": "2022-04-04T00:00:00",
            "value": 5406
          },
          {
            "time": 1649548800,
            "datetime": "2022-04-10T00:00:00",
            "time_iso": "2022-04-10T00:00:00",
            "value": 5410
          },
          {
            "time": 1649808000,
            "datetime": "2022-04-13T00:00:00",
            "time_iso": "2022-04-13T00:00:00",
            "value": 5410
          },
          {
            "time": 1650067200,
            "datetime": "2022-04-16T00:00:00",
            "time_iso": "2022-04-16T00:00:00",
            "value": 5411
          },
          {
            "time": 1650326400,
            "datetime": "2022-04-19T00:00:00",
            "time_iso": "2022-04-19T00:00:00",
            "value": 5411
          },
          {
            "time": 1650499200,
            "datetime": "2022-04-21T00:00:00",
            "time_iso": "2022-04-21T00:00:00",
            "value": 5411
          },
          {
            "time": 1650585600,
            "datetime": "2022-04-22T00:00:00",
            "time_iso": "2022-04-22T00:00:00",
            "value": 5412
          },
          {
            "time": 1650758400,
            "datetime": "2022-04-24T00:00:00",
            "time_iso": "2022-04-24T00:00:00",
            "value": 5413
          },
          {
            "time": 1650931200,
            "datetime": "2022-04-26T00:00:00",
            "time_iso": "2022-04-26T00:00:00",
            "value": 5414
          },
          {
            "time": 1651017600,
            "datetime": "2022-04-27T00:00:00",
            "time_iso": "2022-04-27T00:00:00",
            "value": 5415
          },
          {
            "time": 1651708800,
            "datetime": "2022-05-05T00:00:00",
            "time_iso": "2022-05-05T00:00:00",
            "value": 5420
          },
          {
            "time": 1652400000,
            "datetime": "2022-05-13T00:00:00",
            "time_iso": "2022-05-13T00:00:00",
            "value": 5424
          },
          {
            "time": 1652745600,
            "datetime": "2022-05-17T00:00:00",
            "time_iso": "2022-05-17T00:00:00",
            "value": 5430
          },
          {
            "time": 1653091200,
            "datetime": "2022-05-21T00:00:00",
            "time_iso": "2022-05-21T00:00:00",
            "value": 5434
          },
          {
            "time": 1653350400,
            "datetime": "2022-05-24T00:00:00",
            "time_iso": "2022-05-24T00:00:00",
            "value": 5435
          },
          {
            "time": 1653436800,
            "datetime": "2022-05-25T00:00:00",
            "time_iso": "2022-05-25T00:00:00",
            "value": 5436
          },
          {
            "time": 1653782400,
            "datetime": "2022-05-29T00:00:00",
            "time_iso": "2022-05-29T00:00:00",
            "value": 5435
          },
          {
            "time": 1653955200,
            "datetime": "2022-05-31T00:00:00",
            "time_iso": "2022-05-31T00:00:00",
            "value": 5435
          },
          {
            "time": 1654214400,
            "datetime": "2022-06-03T00:00:00",
            "time_iso": "2022-06-03T00:00:00",
            "value": 5440
          },
          {
            "time": 1654300800,
            "datetime": "2022-06-04T00:00:00",
            "time_iso": "2022-06-04T00:00:00",
            "value": 5438
          },
          {
            "time": 1654560000,
            "datetime": "2022-06-07T00:00:00",
            "time_iso": "2022-06-07T00:00:00",
            "value": 5438
          },
          {
            "time": 1654819200,
            "datetime": "2022-06-10T00:00:00",
            "time_iso": "2022-06-10T00:00:00",
            "value": 5438
          },
          {
            "time": 1654905600,
            "datetime": "2022-06-11T00:00:00",
            "time_iso": "2022-06-11T00:00:00",
            "value": 5441
          },
          {
            "time": 1655164800,
            "datetime": "2022-06-14T00:00:00",
            "time_iso": "2022-06-14T00:00:00",
            "value": 5439
          },
          {
            "time": 1655424000,
            "datetime": "2022-06-17T00:00:00",
            "time_iso": "2022-06-17T00:00:00",
            "value": 5439
          },
          {
            "time": 1655769600,
            "datetime": "2022-06-21T00:00:00",
            "time_iso": "2022-06-21T00:00:00",
            "value": 5441
          },
          {
            "time": 1656028800,
            "datetime": "2022-06-24T00:00:00",
            "time_iso": "2022-06-24T00:00:00",
            "value": 5446
          },
          {
            "time": 1656201600,
            "datetime": "2022-06-26T00:00:00",
            "time_iso": "2022-06-26T00:00:00",
            "value": 5442
          },
          {
            "time": 1656288000,
            "datetime": "2022-06-27T00:00:00",
            "time_iso": "2022-06-27T00:00:00",
            "value": 5448
          },
          {
            "time": 1656460800,
            "datetime": "2022-06-29T00:00:00",
            "time_iso": "2022-06-29T00:00:00",
            "value": 5448
          },
          {
            "time": 1656720000,
            "datetime": "2022-07-02T00:00:00",
            "time_iso": "2022-07-02T00:00:00",
            "value": 5450
          },
          {
            "time": 1656806400,
            "datetime": "2022-07-03T00:00:00",
            "time_iso": "2022-07-03T00:00:00",
            "value": 5446
          },
          {
            "time": 1656979200,
            "datetime": "2022-07-05T00:00:00",
            "time_iso": "2022-07-05T00:00:00",
            "value": 5446
          },
          {
            "time": 1657065600,
            "datetime": "2022-07-06T00:00:00",
            "time_iso": "2022-07-06T00:00:00",
            "value": 5446
          },
          {
            "time": 1657238400,
            "datetime": "2022-07-08T00:00:00",
            "time_iso": "2022-07-08T00:00:00",
            "value": 5446
          },
          {
            "time": 1657324800,
            "datetime": "2022-07-09T00:00:00",
            "time_iso": "2022-07-09T00:00:00",
            "value": 5447
          },
          {
            "time": 1657497600,
            "datetime": "2022-07-11T00:00:00",
            "time_iso": "2022-07-11T00:00:00",
            "value": 5447
          },
          {
            "time": 1657670400,
            "datetime": "2022-07-13T00:00:00",
            "time_iso": "2022-07-13T00:00:00",
            "value": 5452
          },
          {
            "time": 1657843200,
            "datetime": "2022-07-15T00:00:00",
            "time_iso": "2022-07-15T00:00:00",
            "value": 5454
          },
          {
            "time": 1658016000,
            "datetime": "2022-07-17T00:00:00",
            "time_iso": "2022-07-17T00:00:00",
            "value": 5452
          },
          {
            "time": 1658188800,
            "datetime": "2022-07-19T00:00:00",
            "time_iso": "2022-07-19T00:00:00",
            "value": 5452
          },
          {
            "time": 1658361600,
            "datetime": "2022-07-21T00:00:00",
            "time_iso": "2022-07-21T00:00:00",
            "value": 5452
          },
          {
            "time": 1658534400,
            "datetime": "2022-07-23T00:00:00",
            "time_iso": "2022-07-23T00:00:00",
            "value": 5456
          },
          {
            "time": 1658707200,
            "datetime": "2022-07-25T00:00:00",
            "time_iso": "2022-07-25T00:00:00",
            "value": 5454
          },
          {
            "time": 1658880000,
            "datetime": "2022-07-27T00:00:00",
            "time_iso": "2022-07-27T00:00:00",
            "value": 5454
          },
          {
            "time": 1659052800,
            "datetime": "2022-07-29T00:00:00",
            "time_iso": "2022-07-29T00:00:00",
            "value": 5457
          },
          {
            "time": 1659312000,
            "datetime": "2022-08-01T00:00:00",
            "time_iso": "2022-08-01T00:00:00",
            "value": 5455
          },
          {
            "time": 1659398400,
            "datetime": "2022-08-02T00:00:00",
            "time_iso": "2022-08-02T00:00:00",
            "value": 5455
          },
          {
            "time": 1659744000,
            "datetime": "2022-08-06T00:00:00",
            "time_iso": "2022-08-06T00:00:00",
            "value": 5457
          },
          {
            "time": 1659830400,
            "datetime": "2022-08-07T00:00:00",
            "time_iso": "2022-08-07T00:00:00",
            "value": 5457
          },
          {
            "time": 1660003200,
            "datetime": "2022-08-09T00:00:00",
            "time_iso": "2022-08-09T00:00:00",
            "value": 5459
          },
          {
            "time": 1660176000,
            "datetime": "2022-08-11T00:00:00",
            "time_iso": "2022-08-11T00:00:00",
            "value": 5462
          },
          {
            "time": 1660435200,
            "datetime": "2022-08-14T00:00:00",
            "time_iso": "2022-08-14T00:00:00",
            "value": 5463
          },
          {
            "time": 1660608000,
            "datetime": "2022-08-16T00:00:00",
            "time_iso": "2022-08-16T00:00:00",
            "value": 5464
          },
          {
            "time": 1660867200,
            "datetime": "2022-08-19T00:00:00",
            "time_iso": "2022-08-19T00:00:00",
            "value": 5467
          },
          {
            "time": 1661040000,
            "datetime": "2022-08-21T00:00:00",
            "time_iso": "2022-08-21T00:00:00",
            "value": 5469
          },
          {
            "time": 1661126400,
            "datetime": "2022-08-22T00:00:00",
            "time_iso": "2022-08-22T00:00:00",
            "value": 5469
          },
          {
            "time": 1661385600,
            "datetime": "2022-08-25T00:00:00",
            "time_iso": "2022-08-25T00:00:00",
            "value": 5470
          },
          {
            "time": 1661558400,
            "datetime": "2022-08-27T00:00:00",
            "time_iso": "2022-08-27T00:00:00",
            "value": 5475
          },
          {
            "time": 1661904000,
            "datetime": "2022-08-31T00:00:00",
            "time_iso": "2022-08-31T00:00:00",
            "value": 5477
          },
          {
            "time": 1661990400,
            "datetime": "2022-09-01T00:00:00",
            "time_iso": "2022-09-01T00:00:00",
            "value": 5477
          },
          {
            "time": 1662249600,
            "datetime": "2022-09-04T00:00:00",
            "time_iso": "2022-09-04T00:00:00",
            "value": 5479
          },
          {
            "time": 1662422400,
            "datetime": "2022-09-06T00:00:00",
            "time_iso": "2022-09-06T00:00:00",
            "value": 5480
          },
          {
            "time": 1662681600,
            "datetime": "2022-09-09T00:00:00",
            "time_iso": "2022-09-09T00:00:00",
            "value": 5481
          },
          {
            "time": 1662768000,
            "datetime": "2022-09-10T00:00:00",
            "time_iso": "2022-09-10T00:00:00",
            "value": 5484
          },
          {
            "time": 1662854400,
            "datetime": "2022-09-11T00:00:00",
            "time_iso": "2022-09-11T00:00:00",
            "value": 5484
          },
          {
            "time": 1662940800,
            "datetime": "2022-09-12T00:00:00",
            "time_iso": "2022-09-12T00:00:00",
            "value": 5485
          },
          {
            "time": 1663027200,
            "datetime": "2022-09-13T00:00:00",
            "time_iso": "2022-09-13T00:00:00",
            "value": 5487
          },
          {
            "time": 1663113600,
            "datetime": "2022-09-14T00:00:00",
            "time_iso": "2022-09-14T00:00:00",
            "value": 5487
          },
          {
            "time": 1663200000,
            "datetime": "2022-09-15T00:00:00",
            "time_iso": "2022-09-15T00:00:00",
            "value": 5487
          },
          {
            "time": 1663372800,
            "datetime": "2022-09-17T00:00:00",
            "time_iso": "2022-09-17T00:00:00",
            "value": 5489
          },
          {
            "time": 1663545600,
            "datetime": "2022-09-19T00:00:00",
            "time_iso": "2022-09-19T00:00:00",
            "value": 5490
          },
          {
            "time": 1663718400,
            "datetime": "2022-09-21T00:00:00",
            "time_iso": "2022-09-21T00:00:00",
            "value": 5490
          },
          {
            "time": 1663977600,
            "datetime": "2022-09-24T00:00:00",
            "time_iso": "2022-09-24T00:00:00",
            "value": 5492
          },
          {
            "time": 1664150400,
            "datetime": "2022-09-26T00:00:00",
            "time_iso": "2022-09-26T00:00:00",
            "value": 5492
          },
          {
            "time": 1664323200,
            "datetime": "2022-09-28T00:00:00",
            "time_iso": "2022-09-28T00:00:00",
            "value": 5494
          },
          {
            "time": 1664409600,
            "datetime": "2022-09-29T00:00:00",
            "time_iso": "2022-09-29T00:00:00",
            "value": 5495
          },
          {
            "time": 1664496000,
            "datetime": "2022-09-30T00:00:00",
            "time_iso": "2022-09-30T00:00:00",
            "value": 5495
          },
          {
            "time": 1664582400,
            "datetime": "2022-10-01T00:00:00",
            "time_iso": "2022-10-01T00:00:00",
            "value": 5497
          },
          {
            "time": 1664755200,
            "datetime": "2022-10-03T00:00:00",
            "time_iso": "2022-10-03T00:00:00",
            "value": 5499
          },
          {
            "time": 1664928000,
            "datetime": "2022-10-05T00:00:00",
            "time_iso": "2022-10-05T00:00:00",
            "value": 5500
          },
          {
            "time": 1665014400,
            "datetime": "2022-10-06T00:00:00",
            "time_iso": "2022-10-06T00:00:00",
            "value": 5501
          },
          {
            "time": 1665100800,
            "datetime": "2022-10-07T00:00:00",
            "time_iso": "2022-10-07T00:00:00",
            "value": 5501
          },
          {
            "time": 1665187200,
            "datetime": "2022-10-08T00:00:00",
            "time_iso": "2022-10-08T00:00:00",
            "value": 5502
          },
          {
            "time": 1665273600,
            "datetime": "2022-10-09T00:00:00",
            "time_iso": "2022-10-09T00:00:00",
            "value": 5502
          },
          {
            "time": 1665360000,
            "datetime": "2022-10-10T00:00:00",
            "time_iso": "2022-10-10T00:00:00",
            "value": 5502
          },
          {
            "time": 1665446400,
            "datetime": "2022-10-11T00:00:00",
            "time_iso": "2022-10-11T00:00:00",
            "value": 5502
          },
          {
            "time": 1665532800,
            "datetime": "2022-10-12T00:00:00",
            "time_iso": "2022-10-12T00:00:00",
            "value": 5504
          },
          {
            "time": 1665619200,
            "datetime": "2022-10-13T00:00:00",
            "time_iso": "2022-10-13T00:00:00",
            "value": 5505
          },
          {
            "time": 1665705600,
            "datetime": "2022-10-14T00:00:00",
            "time_iso": "2022-10-14T00:00:00",
            "value": 5506
          },
          {
            "time": 1665878400,
            "datetime": "2022-10-16T00:00:00",
            "time_iso": "2022-10-16T00:00:00",
            "value": 5508
          },
          {
            "time": 1665964800,
            "datetime": "2022-10-17T00:00:00",
            "time_iso": "2022-10-17T00:00:00",
            "value": 5508
          },
          {
            "time": 1666137600,
            "datetime": "2022-10-19T00:00:00",
            "time_iso": "2022-10-19T00:00:00",
            "value": 5510
          },
          {
            "time": 1666224000,
            "datetime": "2022-10-20T00:00:00",
            "time_iso": "2022-10-20T00:00:00",
            "value": 5510
          },
          {
            "time": 1666396800,
            "datetime": "2022-10-22T00:00:00",
            "time_iso": "2022-10-22T00:00:00",
            "value": 5512
          },
          {
            "time": 1666742400,
            "datetime": "2022-10-26T00:00:00",
            "time_iso": "2022-10-26T00:00:00",
            "value": 5513
          },
          {
            "time": 1667001600,
            "datetime": "2022-10-29T00:00:00",
            "time_iso": "2022-10-29T00:00:00",
            "value": 5516
          },
          {
            "time": 1667174400,
            "datetime": "2022-10-31T00:00:00",
            "time_iso": "2022-10-31T00:00:00",
            "value": 5518
          },
          {
            "time": 1667260800,
            "datetime": "2022-11-01T00:00:00",
            "time_iso": "2022-11-01T00:00:00",
            "value": 5518
          },
          {
            "time": 1667433600,
            "datetime": "2022-11-03T00:00:00",
            "time_iso": "2022-11-03T00:00:00",
            "value": 5520
          },
          {
            "time": 1667520000,
            "datetime": "2022-11-04T00:00:00",
            "time_iso": "2022-11-04T00:00:00",
            "value": 5521
          },
          {
            "time": 1667692800,
            "datetime": "2022-11-06T00:00:00",
            "time_iso": "2022-11-06T00:00:00",
            "value": 5522
          },
          {
            "time": 1667779200,
            "datetime": "2022-11-07T00:00:00",
            "time_iso": "2022-11-07T00:00:00",
            "value": 5522
          },
          {
            "time": 1667865600,
            "datetime": "2022-11-08T00:00:00",
            "time_iso": "2022-11-08T00:00:00",
            "value": 5522
          },
          {
            "time": 1667952000,
            "datetime": "2022-11-09T00:00:00",
            "time_iso": "2022-11-09T00:00:00",
            "value": 5523
          },
          {
            "time": 1668038400,
            "datetime": "2022-11-10T00:00:00",
            "time_iso": "2022-11-10T00:00:00",
            "value": 5523
          },
          {
            "time": 1668902400,
            "datetime": "2022-11-20T00:00:00",
            "time_iso": "2022-11-20T00:00:00",
            "value": 5535
          },
          {
            "time": 1669334400,
            "datetime": "2022-11-25T00:00:00",
            "time_iso": "2022-11-25T00:00:00",
            "value": 5542
          },
          {
            "time": 1669680000,
            "datetime": "2022-11-29T00:00:00",
            "time_iso": "2022-11-29T00:00:00",
            "value": 5546
          },
          {
            "time": 1669852800,
            "datetime": "2022-12-01T00:00:00",
            "time_iso": "2022-12-01T00:00:00",
            "value": 5551
          },
          {
            "time": 1670025600,
            "datetime": "2022-12-03T00:00:00",
            "time_iso": "2022-12-03T00:00:00",
            "value": 5554
          },
          {
            "time": 1670198400,
            "datetime": "2022-12-05T00:00:00",
            "time_iso": "2022-12-05T00:00:00",
            "value": 5554
          },
          {
            "time": 1670371200,
            "datetime": "2022-12-07T00:00:00",
            "time_iso": "2022-12-07T00:00:00",
            "value": 5556
          },
          {
            "time": 1670544000,
            "datetime": "2022-12-09T00:00:00",
            "time_iso": "2022-12-09T00:00:00",
            "value": 5556
          },
          {
            "time": 1670716800,
            "datetime": "2022-12-11T00:00:00",
            "time_iso": "2022-12-11T00:00:00",
            "value": 5558
          },
          {
            "time": 1670889600,
            "datetime": "2022-12-13T00:00:00",
            "time_iso": "2022-12-13T00:00:00",
            "value": 5559
          },
          {
            "time": 1671062400,
            "datetime": "2022-12-15T00:00:00",
            "time_iso": "2022-12-15T00:00:00",
            "value": 5560
          },
          {
            "time": 1671235200,
            "datetime": "2022-12-17T00:00:00",
            "time_iso": "2022-12-17T00:00:00",
            "value": 5560
          },
          {
            "time": 1671408000,
            "datetime": "2022-12-19T00:00:00",
            "time_iso": "2022-12-19T00:00:00",
            "value": 5561
          },
          {
            "time": 1671580800,
            "datetime": "2022-12-21T00:00:00",
            "time_iso": "2022-12-21T00:00:00",
            "value": 5561
          },
          {
            "time": 1671753600,
            "datetime": "2022-12-23T00:00:00",
            "time_iso": "2022-12-23T00:00:00",
            "value": 5564
          },
          {
            "time": 1671926400,
            "datetime": "2022-12-25T00:00:00",
            "time_iso": "2022-12-25T00:00:00",
            "value": 5564
          },
          {
            "time": 1672099200,
            "datetime": "2022-12-27T00:00:00",
            "time_iso": "2022-12-27T00:00:00",
            "value": 5564
          },
          {
            "time": 1672272000,
            "datetime": "2022-12-29T00:00:00",
            "time_iso": "2022-12-29T00:00:00",
            "value": 5565
          },
          {
            "time": 1672444800,
            "datetime": "2022-12-31T00:00:00",
            "time_iso": "2022-12-31T00:00:00",
            "value": 5566
          },
          {
            "time": 1672617600,
            "datetime": "2023-01-02T00:00:00",
            "time_iso": "2023-01-02T00:00:00",
            "value": 5566
          },
          {
            "time": 1672790400,
            "datetime": "2023-01-04T00:00:00",
            "time_iso": "2023-01-04T00:00:00",
            "value": 5567
          },
          {
            "time": 1672963200,
            "datetime": "2023-01-06T00:00:00",
            "time_iso": "2023-01-06T00:00:00",
            "value": 5568
          },
          {
            "time": 1673136000,
            "datetime": "2023-01-08T00:00:00",
            "time_iso": "2023-01-08T00:00:00",
            "value": 5569
          },
          {
            "time": 1673308800,
            "datetime": "2023-01-10T00:00:00",
            "time_iso": "2023-01-10T00:00:00",
            "value": 5569
          },
          {
            "time": 1673481600,
            "datetime": "2023-01-12T00:00:00",
            "time_iso": "2023-01-12T00:00:00",
            "value": 5571
          },
          {
            "time": 1673654400,
            "datetime": "2023-01-14T00:00:00",
            "time_iso": "2023-01-14T00:00:00",
            "value": 5572
          },
          {
            "time": 1673827200,
            "datetime": "2023-01-16T00:00:00",
            "time_iso": "2023-01-16T00:00:00",
            "value": 5572
          },
          {
            "time": 1674172800,
            "datetime": "2023-01-20T00:00:00",
            "time_iso": "2023-01-20T00:00:00",
            "value": 5574
          },
          {
            "time": 1674259200,
            "datetime": "2023-01-21T00:00:00",
            "time_iso": "2023-01-21T00:00:00",
            "value": 5575
          },
          {
            "time": 1674432000,
            "datetime": "2023-01-23T00:00:00",
            "time_iso": "2023-01-23T00:00:00",
            "value": 5576
          },
          {
            "time": 1674604800,
            "datetime": "2023-01-25T00:00:00",
            "time_iso": "2023-01-25T00:00:00",
            "value": 5577
          },
          {
            "time": 1674777600,
            "datetime": "2023-01-27T00:00:00",
            "time_iso": "2023-01-27T00:00:00",
            "value": 5578
          },
          {
            "time": 1675641600,
            "datetime": "2023-02-06T00:00:00",
            "time_iso": "2023-02-06T00:00:00",
            "value": 5584
          },
          {
            "time": 1675987200,
            "datetime": "2023-02-10T00:00:00",
            "time_iso": "2023-02-10T00:00:00",
            "value": 5585
          },
          {
            "time": 1676073600,
            "datetime": "2023-02-11T00:00:00",
            "time_iso": "2023-02-11T00:00:00",
            "value": 5586
          },
          {
            "time": 1676246400,
            "datetime": "2023-02-13T00:00:00",
            "time_iso": "2023-02-13T00:00:00",
            "value": 5586
          },
          {
            "time": 1676419200,
            "datetime": "2023-02-15T00:00:00",
            "time_iso": "2023-02-15T00:00:00",
            "value": 5588
          },
          {
            "time": 1676592000,
            "datetime": "2023-02-17T00:00:00",
            "time_iso": "2023-02-17T00:00:00",
            "value": 5590
          },
          {
            "time": 1676764800,
            "datetime": "2023-02-19T00:00:00",
            "time_iso": "2023-02-19T00:00:00",
            "value": 5590
          },
          {
            "time": 1676937600,
            "datetime": "2023-02-21T00:00:00",
            "time_iso": "2023-02-21T00:00:00",
            "value": 5590
          },
          {
            "time": 1677110400,
            "datetime": "2023-02-23T00:00:00",
            "time_iso": "2023-02-23T00:00:00",
            "value": 5592
          },
          {
            "time": 1677283200,
            "datetime": "2023-02-25T00:00:00",
            "time_iso": "2023-02-25T00:00:00",
            "value": 5593
          },
          {
            "time": 1677456000,
            "datetime": "2023-02-27T00:00:00",
            "time_iso": "2023-02-27T00:00:00",
            "value": 5593
          },
          {
            "time": 1677628800,
            "datetime": "2023-03-01T00:00:00",
            "time_iso": "2023-03-01T00:00:00",
            "value": 5595
          },
          {
            "time": 1677801600,
            "datetime": "2023-03-03T00:00:00",
            "time_iso": "2023-03-03T00:00:00",
            "value": 5596
          },
          {
            "time": 1677974400,
            "datetime": "2023-03-05T00:00:00",
            "time_iso": "2023-03-05T00:00:00",
            "value": 5597
          },
          {
            "time": 1678060800,
            "datetime": "2023-03-06T00:00:00",
            "time_iso": "2023-03-06T00:00:00",
            "value": 5598
          },
          {
            "time": 1678233600,
            "datetime": "2023-03-08T00:00:00",
            "time_iso": "2023-03-08T00:00:00",
            "value": 5599
          },
          {
            "time": 1678406400,
            "datetime": "2023-03-10T00:00:00",
            "time_iso": "2023-03-10T00:00:00",
            "value": 5604
          },
          {
            "time": 1678579200,
            "datetime": "2023-03-12T00:00:00",
            "time_iso": "2023-03-12T00:00:00",
            "value": 5606
          },
          {
            "time": 1678665600,
            "datetime": "2023-03-13T00:00:00",
            "time_iso": "2023-03-13T00:00:00",
            "value": 5608
          },
          {
            "time": 1678838400,
            "datetime": "2023-03-15T00:00:00",
            "time_iso": "2023-03-15T00:00:00",
            "value": 5608
          },
          {
            "time": 1679011200,
            "datetime": "2023-03-17T00:00:00",
            "time_iso": "2023-03-17T00:00:00",
            "value": 5608
          },
          {
            "time": 1679097600,
            "datetime": "2023-03-18T00:00:00",
            "time_iso": "2023-03-18T00:00:00",
            "value": 5610
          },
          {
            "time": 1679184000,
            "datetime": "2023-03-19T00:00:00",
            "time_iso": "2023-03-19T00:00:00",
            "value": 5610
          },
          {
            "time": 1679356800,
            "datetime": "2023-03-21T00:00:00",
            "time_iso": "2023-03-21T00:00:00",
            "value": 5610
          },
          {
            "time": 1679529600,
            "datetime": "2023-03-23T00:00:00",
            "time_iso": "2023-03-23T00:00:00",
            "value": 5611
          },
          {
            "time": 1679616000,
            "datetime": "2023-03-24T00:00:00",
            "time_iso": "2023-03-24T00:00:00",
            "value": 5612
          },
          {
            "time": 1679702400,
            "datetime": "2023-03-25T00:00:00",
            "time_iso": "2023-03-25T00:00:00",
            "value": 5613
          },
          {
            "time": 1679961600,
            "datetime": "2023-03-28T00:00:00",
            "time_iso": "2023-03-28T00:00:00",
            "value": 5613
          },
          {
            "time": 1680048000,
            "datetime": "2023-03-29T00:00:00",
            "time_iso": "2023-03-29T00:00:00",
            "value": 5614
          },
          {
            "time": 1680220800,
            "datetime": "2023-03-31T00:00:00",
            "time_iso": "2023-03-31T00:00:00",
            "value": 5614
          },
          {
            "time": 1680307200,
            "datetime": "2023-04-01T00:00:00",
            "time_iso": "2023-04-01T00:00:00",
            "value": 5616
          },
          {
            "time": 1680393600,
            "datetime": "2023-04-02T00:00:00",
            "time_iso": "2023-04-02T00:00:00",
            "value": 5616
          },
          {
            "time": 1680480000,
            "datetime": "2023-04-03T00:00:00",
            "time_iso": "2023-04-03T00:00:00",
            "value": 5618
          },
          {
            "time": 1680652800,
            "datetime": "2023-04-05T00:00:00",
            "time_iso": "2023-04-05T00:00:00",
            "value": 5618
          },
          {
            "time": 1680912000,
            "datetime": "2023-04-08T00:00:00",
            "time_iso": "2023-04-08T00:00:00",
            "value": 5622
          },
          {
            "time": 1681084800,
            "datetime": "2023-04-10T00:00:00",
            "time_iso": "2023-04-10T00:00:00",
            "value": 5622
          },
          {
            "time": 1681257600,
            "datetime": "2023-04-12T00:00:00",
            "time_iso": "2023-04-12T00:00:00",
            "value": 5622
          },
          {
            "time": 1682467200,
            "datetime": "2023-04-26T00:00:00",
            "time_iso": "2023-04-26T00:00:00",
            "value": 5630
          },
          {
            "time": 1682640000,
            "datetime": "2023-04-28T00:00:00",
            "time_iso": "2023-04-28T00:00:00",
            "value": 5632
          },
          {
            "time": 1682812800,
            "datetime": "2023-04-30T00:00:00",
            "time_iso": "2023-04-30T00:00:00",
            "value": 5633
          },
          {
            "time": 1683072000,
            "datetime": "2023-05-03T00:00:00",
            "time_iso": "2023-05-03T00:00:00",
            "value": 5634
          },
          {
            "time": 1683158400,
            "datetime": "2023-05-04T00:00:00",
            "time_iso": "2023-05-04T00:00:00",
            "value": 5634
          },
          {
            "time": 1683244800,
            "datetime": "2023-05-05T00:00:00",
            "time_iso": "2023-05-05T00:00:00",
            "value": 5634
          },
          {
            "time": 1683331200,
            "datetime": "2023-05-06T00:00:00",
            "time_iso": "2023-05-06T00:00:00",
            "value": 5635
          },
          {
            "time": 1683417600,
            "datetime": "2023-05-07T00:00:00",
            "time_iso": "2023-05-07T00:00:00",
            "value": 5635
          },
          {
            "time": 1683504000,
            "datetime": "2023-05-08T00:00:00",
            "time_iso": "2023-05-08T00:00:00",
            "value": 5635
          },
          {
            "time": 1683590400,
            "datetime": "2023-05-09T00:00:00",
            "time_iso": "2023-05-09T00:00:00",
            "value": 5635
          },
          {
            "time": 1683676800,
            "datetime": "2023-05-10T00:00:00",
            "time_iso": "2023-05-10T00:00:00",
            "value": 5635
          },
          {
            "time": 1683763200,
            "datetime": "2023-05-11T00:00:00",
            "time_iso": "2023-05-11T00:00:00",
            "value": 5635
          },
          {
            "time": 1683849600,
            "datetime": "2023-05-12T00:00:00",
            "time_iso": "2023-05-12T00:00:00",
            "value": 5635
          },
          {
            "time": 1683936000,
            "datetime": "2023-05-13T00:00:00",
            "time_iso": "2023-05-13T00:00:00",
            "value": 5636
          },
          {
            "time": 1684022400,
            "datetime": "2023-05-14T00:00:00",
            "time_iso": "2023-05-14T00:00:00",
            "value": 5637
          },
          {
            "time": 1684195200,
            "datetime": "2023-05-16T00:00:00",
            "time_iso": "2023-05-16T00:00:00",
            "value": 5637
          },
          {
            "time": 1684281600,
            "datetime": "2023-05-17T00:00:00",
            "time_iso": "2023-05-17T00:00:00",
            "value": 5638
          },
          {
            "time": 1684368000,
            "datetime": "2023-05-18T00:00:00",
            "time_iso": "2023-05-18T00:00:00",
            "value": 5639
          },
          {
            "time": 1684454400,
            "datetime": "2023-05-19T00:00:00",
            "time_iso": "2023-05-19T00:00:00",
            "value": 5639
          },
          {
            "time": 1687737600,
            "datetime": "2023-06-26T00:00:00",
            "time_iso": "2023-06-26T00:00:00",
            "value": 5657
          },
          {
            "time": 1687824000,
            "datetime": "2023-06-27T00:00:00",
            "time_iso": "2023-06-27T00:00:00",
            "value": 5657
          },
          {
            "time": 1687910400,
            "datetime": "2023-06-28T00:00:00",
            "time_iso": "2023-06-28T00:00:00",
            "value": 5657
          },
          {
            "time": 1688083200,
            "datetime": "2023-06-30T00:00:00",
            "time_iso": "2023-06-30T00:00:00",
            "value": 5658
          },
          {
            "time": 1688169600,
            "datetime": "2023-07-01T00:00:00",
            "time_iso": "2023-07-01T00:00:00",
            "value": 5661
          },
          {
            "time": 1688342400,
            "datetime": "2023-07-03T00:00:00",
            "time_iso": "2023-07-03T00:00:00",
            "value": 5661
          },
          {
            "time": 1688515200,
            "datetime": "2023-07-05T00:00:00",
            "time_iso": "2023-07-05T00:00:00",
            "value": 5661
          },
          {
            "time": 1688688000,
            "datetime": "2023-07-07T00:00:00",
            "time_iso": "2023-07-07T00:00:00",
            "value": 5663
          },
          {
            "time": 1688860800,
            "datetime": "2023-07-09T00:00:00",
            "time_iso": "2023-07-09T00:00:00",
            "value": 5664
          },
          {
            "time": 1689033600,
            "datetime": "2023-07-11T00:00:00",
            "time_iso": "2023-07-11T00:00:00",
            "value": 5664
          },
          {
            "time": 1689206400,
            "datetime": "2023-07-13T00:00:00",
            "time_iso": "2023-07-13T00:00:00",
            "value": 5665
          },
          {
            "time": 1689379200,
            "datetime": "2023-07-15T00:00:00",
            "time_iso": "2023-07-15T00:00:00",
            "value": 5667
          },
          {
            "time": 1689552000,
            "datetime": "2023-07-17T00:00:00",
            "time_iso": "2023-07-17T00:00:00",
            "value": 5667
          },
          {
            "time": 1689811200,
            "datetime": "2023-07-20T00:00:00",
            "time_iso": "2023-07-20T00:00:00",
            "value": 5668
          },
          {
            "time": 1689984000,
            "datetime": "2023-07-22T00:00:00",
            "time_iso": "2023-07-22T00:00:00",
            "value": 5670
          },
          {
            "time": 1690588800,
            "datetime": "2023-07-29T00:00:00",
            "time_iso": "2023-07-29T00:00:00",
            "value": 5675
          },
          {
            "time": 1690761600,
            "datetime": "2023-07-31T00:00:00",
            "time_iso": "2023-07-31T00:00:00",
            "value": 5675
          },
          {
            "time": 1690934400,
            "datetime": "2023-08-02T00:00:00",
            "time_iso": "2023-08-02T00:00:00",
            "value": 5675
          },
          {
            "time": 1691107200,
            "datetime": "2023-08-04T00:00:00",
            "time_iso": "2023-08-04T00:00:00",
            "value": 5676
          },
          {
            "time": 1691280000,
            "datetime": "2023-08-06T00:00:00",
            "time_iso": "2023-08-06T00:00:00",
            "value": 5678
          },
          {
            "time": 1691452800,
            "datetime": "2023-08-08T00:00:00",
            "time_iso": "2023-08-08T00:00:00",
            "value": 5678
          },
          {
            "time": 1691625600,
            "datetime": "2023-08-10T00:00:00",
            "time_iso": "2023-08-10T00:00:00",
            "value": 5680
          },
          {
            "time": 1691798400,
            "datetime": "2023-08-12T00:00:00",
            "time_iso": "2023-08-12T00:00:00",
            "value": 5683
          },
          {
            "time": 1691971200,
            "datetime": "2023-08-14T00:00:00",
            "time_iso": "2023-08-14T00:00:00",
            "value": 5683
          },
          {
            "time": 1692144000,
            "datetime": "2023-08-16T00:00:00",
            "time_iso": "2023-08-16T00:00:00",
            "value": 5683
          },
          {
            "time": 1692316800,
            "datetime": "2023-08-18T00:00:00",
            "time_iso": "2023-08-18T00:00:00",
            "value": 5684
          },
          {
            "time": 1692489600,
            "datetime": "2023-08-20T00:00:00",
            "time_iso": "2023-08-20T00:00:00",
            "value": 5685
          },
          {
            "time": 1692662400,
            "datetime": "2023-08-22T00:00:00",
            "time_iso": "2023-08-22T00:00:00",
            "value": 5686
          },
          {
            "time": 1692835200,
            "datetime": "2023-08-24T00:00:00",
            "time_iso": "2023-08-24T00:00:00",
            "value": 5688
          },
          {
            "time": 1693008000,
            "datetime": "2023-08-26T00:00:00",
            "time_iso": "2023-08-26T00:00:00",
            "value": 5689
          },
          {
            "time": 1693180800,
            "datetime": "2023-08-28T00:00:00",
            "time_iso": "2023-08-28T00:00:00",
            "value": 5689
          },
          {
            "time": 1693353600,
            "datetime": "2023-08-30T00:00:00",
            "time_iso": "2023-08-30T00:00:00",
            "value": 5693
          },
          {
            "time": 1693526400,
            "datetime": "2023-09-01T00:00:00",
            "time_iso": "2023-09-01T00:00:00",
            "value": 5694
          },
          {
            "time": 1693699200,
            "datetime": "2023-09-03T00:00:00",
            "time_iso": "2023-09-03T00:00:00",
            "value": 5696
          },
          {
            "time": 1693872000,
            "datetime": "2023-09-05T00:00:00",
            "time_iso": "2023-09-05T00:00:00",
            "value": 5696
          },
          {
            "time": 1694044800,
            "datetime": "2023-09-07T00:00:00",
            "time_iso": "2023-09-07T00:00:00",
            "value": 5696
          },
          {
            "time": 1694217600,
            "datetime": "2023-09-09T00:00:00",
            "time_iso": "2023-09-09T00:00:00",
            "value": 5697
          },
          {
            "time": 1694390400,
            "datetime": "2023-09-11T00:00:00",
            "time_iso": "2023-09-11T00:00:00",
            "value": 5697
          },
          {
            "time": 1694563200,
            "datetime": "2023-09-13T00:00:00",
            "time_iso": "2023-09-13T00:00:00",
            "value": 5699
          },
          {
            "time": 1694736000,
            "datetime": "2023-09-15T00:00:00",
            "time_iso": "2023-09-15T00:00:00",
            "value": 5701
          },
          {
            "time": 1694908800,
            "datetime": "2023-09-17T00:00:00",
            "time_iso": "2023-09-17T00:00:00",
            "value": 5703
          },
          {
            "time": 1695081600,
            "datetime": "2023-09-19T00:00:00",
            "time_iso": "2023-09-19T00:00:00",
            "value": 5706
          },
          {
            "time": 1695254400,
            "datetime": "2023-09-21T00:00:00",
            "time_iso": "2023-09-21T00:00:00",
            "value": 5708
          },
          {
            "time": 1696377600,
            "datetime": "2023-10-04T00:00:00",
            "time_iso": "2023-10-04T00:00:00",
            "value": 5714
          },
          {
            "time": 1696550400,
            "datetime": "2023-10-06T00:00:00",
            "time_iso": "2023-10-06T00:00:00",
            "value": 5715
          }
        ]
      }
    },
    "media": [
      {
        "id": "y4VlhFP_-zc",
        "title": "Hear from Vice President Pence at NASA Langley",
        "description": "Humanity’s return to the Moon with our Artemis program will be a forerunner to future human missions to Mars.\n\nHear about America’s future in space from Vice President Mike Pence, along with NASA Administrator Jim Bridenstine, at 12:45 p.m. EST Wednesday, Feb 19 during a visit to our Langley Research Center.",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/y4VlhFP_-zc/hqdefault.jpg",
        "time_added": 0,
        "time_added_iso": "1970-01-01T00:00:00",
        "metrics": {
          "views_count": {
            "value": 7301
          },
          "likes_count": {
            "value": 929
          },
          "dislikes_count": {
            "value": 114
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 2523
          },
          "comments_count": {
            "value": 63
          },
          "engagement": {
            "value": 992
          },
          "er": {
            "value": 13.15,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.15
          },
          "cpm": {
            "value": 204.0816,
            "value_from": 68.4838,
            "value_to": 684.8377,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "poor"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "yJUJmI8YI_E",
        "title": "NASA’s Juno Spacecraft Flies Past Io and Jupiter, With Music by Vangelis",
        "description": "On May 16, 2023, NASA’s Juno spacecraft flew past Jupiter’s volcanic moon Io, and then the gas giant soon after. Io is the most volcanically active body in the solar system. Slightly larger than Earth’s moon, Io is a world in constant torment. Not only is the biggest planet in the solar system forever pulling at it gravitationally, but so are its Galilean siblings – Europa and the biggest moon in the solar system, Ganymede. The result is that Io is continuously stretched and squeezed, actions linked to the creation of the lava seen erupting from its many volcanoes.\n\nThis rendering provides a “starship captain” point of view of the flyby, using images from JunoCam. For both targets, Io and Jupiter, raw JunoCam images were reprojected into views similar to the perspective of a consumer camera. The Io flyby and the Jupiter approach movie were rendered separately and composed into a synchronous split-screen video.\n\nLaunched on Aug. 5, 2011, Juno embarked on a 5-year journey to Jupiter. Its mission: to probe beneath the planet's dense clouds and answer questions about the origin and evolution of Jupiter, our solar system, and giant planets in general across the cosmos. Juno arrived at the gas giant on July 4, 2016, after a 1.7-billion-mile journey, and settled into a 53-day polar orbit stretching from just above Jupiter’s cloud tops to the outer reaches of the Jovian magnetosphere. Now in its extended mission, NASA’s most distant planetary orbiter continues doing flybys of Jupiter and its moons.\n \nVisit http://www.nasa.gov/juno & http://missionjuno.swri.edu to learn more.\n \nAnimation: Koji Kuramura and Gerald Eichstädt\nMusic: Vangelis \nProducer: Scott J. Bolton\nCredit: NASA/JPL-Caltech/SwRI/MSSS",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/yJUJmI8YI_E/hqdefault.jpg",
        "time_added": 1690329600,
        "time_added_iso": "2023-07-26T00:00:00",
        "metrics": {
          "views_count": {
            "value": 86356
          },
          "likes_count": {
            "value": 1852
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 47
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1852
          },
          "er": {
            "value": 2.14,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.79
          },
          "cpm": {
            "value": 17.2542,
            "value_from": 5.79,
            "value_to": 57.8999,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "average"
              },
              "90d": {
                "mark": "average"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "o3_tfvsNCmU",
        "title": "How Do Planets Get Their Names? We Asked a NASA Expert",
        "description": "How do planets get their names? With the exception of Earth, the planets in our solar system were named after Greek or Roman gods. Today, the job of naming things in space falls to the International Astronomical Union (IAU), the internationally recognized authority for naming celestial bodies and their surface features. NASA scientist Dr. Henry Throop explains more.\n\nLink to download this video: https://go.nasa.gov/3Qc2qMI\n\nProducers: Jessica Wilde, Scott Bednar\nEditor: David Shelton\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/o3_tfvsNCmU/hqdefault.jpg",
        "time_added": 1690329600,
        "time_added_iso": "2023-07-26T00:00:00",
        "metrics": {
          "views_count": {
            "value": 30883
          },
          "likes_count": {
            "value": 1539
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 106
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1539
          },
          "er": {
            "value": 4.98,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.64
          },
          "cpm": {
            "value": 48.2466,
            "value_from": 16.1901,
            "value_to": 161.9014,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "RrlDv-ts2f0",
        "title": "Introducing NASA's On-Demand Streaming Service, NASA+ (Official Trailer)",
        "description": "Introducing NASA's new streaming service, NASA+, launching soon. More space. More rockets. More science. More missions. More NASA. All in one place. No subscription needed.\n\nNASA+ is ad free, no cost, and family friendly. It will feature NASA's Emmy award-winning live coverage, and new original video series.\n\nNASA+ will be available on most major platforms via the NASA App on iOS and Android mobile and tablet devices; streaming media players such as, Roku, Apple TV, and Fire TV; and on the web across desktop and mobile devices.  \n\nDownload the NASA app now to be one of the first to get NASA+ when it drops. https://www.nasa.gov/nasaapp\n\nProducer: Phil Sexton\nEditors: Phil Sexton & Sonnet Apple\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/RrlDv-ts2f0/hqdefault.jpg",
        "time_added": 1690416000,
        "time_added_iso": "2023-07-27T00:00:00",
        "metrics": {
          "views_count": {
            "value": 156398
          },
          "likes_count": {
            "value": 5068
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 59
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 5068
          },
          "er": {
            "value": 3.24,
            "mark": "fair"
          },
          "views_performance": {
            "value": 3.24
          },
          "cpm": {
            "value": 9.527,
            "value_from": 3.197,
            "value_to": 31.9697,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "good"
              },
              "90d": {
                "mark": "good"
              },
              "180d": {
                "mark": "good"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "cBWbVrOlYHc",
        "title": "Our Next Space Station Crew Rotation Flight on This Week @NASA – July 28, 2023",
        "description": "Our next space station crew rotation flight, a launch day simulation for our upcoming Moon mission, and visiting the splashdown recovery crew for Artemis II … a few of the stories to tell you about – This Week at NASA!\n\nLink to download this video: https://images.nasa.gov/details/Our%20Next%20Space%20Station%20Crew%20Rotation%20Flight%20on%20This%20Week%20@NASA%20%E2%80%93%20July%2028,%202023\n\nVideo Producer: Andre Valentine\nVideo Editor: Andre Valentine\nNarrator: Andre Valentine\nMusic: Universal Production Music\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/cBWbVrOlYHc/hqdefault.jpg",
        "time_added": 1690502400,
        "time_added_iso": "2023-07-28T00:00:00",
        "metrics": {
          "views_count": {
            "value": 61852
          },
          "likes_count": {
            "value": 1969
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 159
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1969
          },
          "er": {
            "value": 3.18,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.28
          },
          "cpm": {
            "value": 24.0898,
            "value_from": 8.0838,
            "value_to": 80.8381,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "NpHFB_DYXhY",
        "title": "Launch of Northrop Grumman's 19th Cargo Mission to the Space Station (Official NASA Broadcast)",
        "description": "Watch live as medical studies, a new water dispenser, artwork from students around the world, and other research and supplies lift off for the International Space Station on Northrop Grumman's next rocket launch from NASA's Wallops Flight Facility at Wallops Island, Virginia. \n\nThe mission's uncrewed Cygnus spacecraft (named S.S. Laurel Clark) is scheduled to blast off atop an Antares rocket no earlier than Tuesday, Aug. 1, 2023, at 8:31 p.m. EST (0031 Aug. 2 UTC), docking with the ISS on Friday, Aug. 4.\n\nCredit: NASA\n\n#NASA #Launch #CRS19",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/NpHFB_DYXhY/hqdefault.jpg",
        "time_added": 1690848000,
        "time_added_iso": "2023-08-01T00:00:00",
        "metrics": {
          "views_count": {
            "value": 451944
          },
          "likes_count": {
            "value": 8874
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 3105
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 8874
          },
          "er": {
            "value": 1.96,
            "mark": "fair"
          },
          "views_performance": {
            "value": 9.37
          },
          "cpm": {
            "value": 3.2969,
            "value_from": 1.1063,
            "value_to": 11.0633,
            "performance": {
              "7d": {
                "mark": "good"
              },
              "30d": {
                "mark": "excellent"
              },
              "90d": {
                "mark": "very_good"
              },
              "180d": {
                "mark": "very_good"
              },
              "365d": {
                "mark": "good"
              },
              "all": {
                "mark": "very_good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "TUinL0C_zgE",
        "title": "Is Climate Change the Same as Global Warming? – We Asked a NASA Expert",
        "description": "Is climate change the same as global warming? Not quite. The warming of Earth — or global warming — is just one factor that makes up a range of changes that are happening to our planet, which is climate change. And NASA is studying all of it: https://climate.nasa.gov/\n\nLink to download this video: https://go.nasa.gov/3OFwkb2\n\nProducers: Jessica Wilde, Scott Bednar\nEditor: Daniel Salazar\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/TUinL0C_zgE/hqdefault.jpg",
        "time_added": 1690934400,
        "time_added_iso": "2023-08-02T00:00:00",
        "metrics": {
          "views_count": {
            "value": 31528
          },
          "likes_count": {
            "value": 1440
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 77
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1440
          },
          "er": {
            "value": 4.57,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.65
          },
          "cpm": {
            "value": 47.2596,
            "value_from": 15.8589,
            "value_to": 158.5892,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "fetKc752V6M",
        "title": "A Commercial Resupply Mission Heads to the Space Station on This Week @NASA – August 4, 2023",
        "description": "A commercial resupply mission heads to the space station, a key piece of hardware for a future Moon mission is on the move, and another spacecraft gets ready to spread its wings in deep space … a few of the stories to tell you about – This Week at NASA!\n\nLink to download this video: https://images.nasa.gov/details/A%20Commercial%20Resupply%20Mission%20Heads%20to%20the%20Space%20Station%20on%20This%20Week%20@NASA%20%E2%80%93%20August%204,%202023\n\nVideo Producer: Andre Valentine\nVideo Editor: Andre Valentine\nNarrator: Andre Valentine\nMusic: Universal Production Music\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/fetKc752V6M/hqdefault.jpg",
        "time_added": 1691107200,
        "time_added_iso": "2023-08-04T00:00:00",
        "metrics": {
          "views_count": {
            "value": 68051
          },
          "likes_count": {
            "value": 2065
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 156
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2065
          },
          "er": {
            "value": 3.03,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.41
          },
          "cpm": {
            "value": 21.8953,
            "value_from": 7.3474,
            "value_to": 73.4743,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "0uWzj4AiiZ8",
        "title": "Artemis II Astronauts’ First Look at Their Lunar Spacecraft",
        "description": "Today, the Artemis II astronauts got their first look at the Orion spacecraft slated to fly them around the Moon in late 2024. \n\nThe Artemis II crew consists of NASA astronauts Reid Wiseman, Victor Glover, and Christina Koch, and Canadian Space Agency astronaut Jeremy Hansen. Artemis II is the first crewed mission on our path to establishing a long-term human presence on the Moon, and is the first mission with astronauts to the Moon's orbit in more than 50 years.\n\nThe approximately 10-day flight test will launch on the powerful Space Launch System rocket, prove the Orion spacecraft’s life-support systems, and validate the capabilities and techniques needed for humans to live and work in deep space.\n\nLearn more about the Artemis II crew and their mission at: https://www.nasa.gov/artemis-ii\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/0uWzj4AiiZ8/hqdefault.jpg",
        "time_added": 1691452800,
        "time_added_iso": "2023-08-08T00:00:00",
        "metrics": {
          "views_count": {
            "value": 179360
          },
          "likes_count": {
            "value": 11946
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 50
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 11946
          },
          "er": {
            "value": 6.66,
            "mark": "fair"
          },
          "views_performance": {
            "value": 3.72
          },
          "cpm": {
            "value": 8.3073,
            "value_from": 2.7877,
            "value_to": 27.8769,
            "performance": {
              "7d": {
                "mark": "good"
              },
              "30d": {
                "mark": "good"
              },
              "90d": {
                "mark": "good"
              },
              "180d": {
                "mark": "good"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "e_EaXO-9iVE",
        "title": "How Will We Extract Water on the Moon? We Asked a NASA Technologist",
        "description": "We know the Moon contains water, but, could future astronauts access and make use of it? That’s the goal. At NASA, we’re actively trying to answer that question. Once it lands at the lunar south pole, our PRIME-1 — Polar Resources Ice Mining Experiment-1 – will robotically sample and analyze ice from beneath the lunar surface, contributing to our search for water on the Moon: https://go.nasa.gov/2QygCmF\n\nProducers: Jessica Wilde, Scott Bednar\n\nEditor: James Lucas",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/e_EaXO-9iVE/hqdefault.jpg",
        "time_added": 1691539200,
        "time_added_iso": "2023-08-09T00:00:00",
        "metrics": {
          "views_count": {
            "value": 52223
          },
          "likes_count": {
            "value": 1978
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 100
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1978
          },
          "er": {
            "value": 3.79,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.08
          },
          "cpm": {
            "value": 28.5315,
            "value_from": 9.5743,
            "value_to": 95.7433,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "YdUAVQYohGo",
        "title": "The Artemis II Astronauts Check Out Their Ride to the Moon on This Week @NASA – August 11, 2023",
        "description": "The Artemis II astronauts check out their ride to the Moon, practicing post-splashdown recovery operations for Artemis II, and the Webb Space Telescope checks out a record-breaking star … a few of the stories to tell you about – This Week at NASA!\n\nLink to download this video:\nhttps://images.nasa.gov/details/The%20Artemis%20II%20Astronauts%20Check%20Out%20Their%20Ride%20to%20the%20Moon%20on%20This%20Week%20@NASA%20%E2%80%93%20August%2011,%202023\n\n\nVideo Producer: Andre Valentine\nVideo Editor: Andre Valentine\nNarrator: Andre Valentine\nMusic: Universal Production Music\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/YdUAVQYohGo/hqdefault.jpg",
        "time_added": 1691712000,
        "time_added_iso": "2023-08-11T00:00:00",
        "metrics": {
          "views_count": {
            "value": 62845
          },
          "likes_count": {
            "value": 2609
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 176
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2609
          },
          "er": {
            "value": 4.15,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.3
          },
          "cpm": {
            "value": 23.7091,
            "value_from": 7.9561,
            "value_to": 79.5608,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "HZ3q7yArd_8",
        "title": "NASA Science Live: The Summer of Record-Breaking Heat",
        "description": "This summer, Earth has been experiencing some of the hottest temperatures on record and July is shaping up to follow this record-breaking trend. Join NASA climate experts on Monday, Aug. 14 as they discuss impacts of climate change, and how data can be used to mitigate its effects.\n\nSubmit your questions in our live chat.\n\nMore on NASA's climate research: https://climate.nasa.gov \n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/HZ3q7yArd_8/hqdefault.jpg",
        "time_added": 1691971200,
        "time_added_iso": "2023-08-14T00:00:00",
        "metrics": {
          "views_count": {
            "value": 37647
          },
          "likes_count": {
            "value": 1552
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 3665
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1552
          },
          "er": {
            "value": 4.12,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.78
          },
          "cpm": {
            "value": 39.5782,
            "value_from": 13.2813,
            "value_to": 132.8127,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "nvQU-klzd7Q",
        "title": "NASA, NOAA Climate Experts Discuss Record-Breaking Heat (Official News Briefing)",
        "description": "On the heels of record-breaking June temperatures, climate experts from NASA and NOAA (the National Oceanographic and Atmospheric Administration) will discuss the latest findings, and how using satellite data can help manage the effects of climate change. \n\nParticipants include: \n\n• Bill Nelson, administrator, NASA\n• Kate Calvin, chief scientist and senior climate advisor, NASA Headquarters\n• Karen St. Germain, director, Earth Science Division, NASA Headquarters \n• Gavin Schmidt, director, NASA Goddard Institute for Space Studies, New York \n• Carlos Del Castillo, chief, Ocean Ecology Laboratory at NASA Goddard Space Flight Center in Greenbelt, Maryland  \n• Sarah Kapnick, chief scientist, NOAA\n\nThen, join us at 3:30 p.m. EDT (1930 UTC) for a NASA Science Live episode to discuss recent climate trends. Ask questions in our live chat and they may get answered on air: https://www.youtube.com/live/HZ3q7yArd_8?feature=share\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/nvQU-klzd7Q/hqdefault.jpg",
        "time_added": 1691971200,
        "time_added_iso": "2023-08-14T00:00:00",
        "metrics": {
          "views_count": {
            "value": 41610
          },
          "likes_count": {
            "value": 2010
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 1990
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2010
          },
          "er": {
            "value": 4.83,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.86
          },
          "cpm": {
            "value": 35.8087,
            "value_from": 12.0163,
            "value_to": 120.1634,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "h78GhU4dgB8",
        "title": "Do Robots Help Humans in Space? We Asked a NASA Technologist",
        "description": "When it comes to space, humans and robots go way back. We rely heavily on our mechanical friends to perform tasks that are too dangerous, difficult, or out of reach for us humans. We’re even working on a new generation of robots that will help us explore in advanced and novel ways.\n\nLearn more about the CADRE—Cooperative Autonomous Distributed Robotic Exploration—project and how this new network of mini rovers could enable future self-guided robotic exploration of the Moon, Mars, and beyond. https://go.nasa.gov/3k5EuZx\n\nProducers: Scott Bednar, Jessica Wilde\nEditor: James Lucas\n\nLink to download this video: https://images.nasa.gov/details/Do%20Robots%20Help%20Humans%20in%20Space_%20-%20Horizontal%20Video\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/h78GhU4dgB8/hqdefault.jpg",
        "time_added": 1692144000,
        "time_added_iso": "2023-08-16T00:00:00",
        "metrics": {
          "views_count": {
            "value": 39236
          },
          "likes_count": {
            "value": 1429
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 97
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1429
          },
          "er": {
            "value": 3.64,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.81
          },
          "cpm": {
            "value": 37.9753,
            "value_from": 12.7434,
            "value_to": 127.434,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "zgCU5opdPhk",
        "title": "Find out why July 2023 was a record-breaking month on This Week @NASA – August 18, 2023",
        "description": "Find out why July 2023 was a record-breaking month, a high-flying NASA aircraft is helping to study lighting, and making landings safe for flights of the future … a few of the stories to tell you about – This Week at NASA!\n\nLink to download this video:\nhttps://images.nasa.gov/details/Find%20out%20why%20July%202023%20was%20a%20record-breaking%20month%20on%20This%20Week%20@NASA%20%E2%80%93%20August%2018,%202023\n \nVideo Producer: Andre Valentine and Haley Reed\nVideo Editor: Haley Reed\nNarrator: Jesse Carpenter\nMusic: Universal Production Music\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/zgCU5opdPhk/hqdefault.jpg",
        "time_added": 1692316800,
        "time_added_iso": "2023-08-18T00:00:00",
        "metrics": {
          "views_count": {
            "value": 47522
          },
          "likes_count": {
            "value": 1882
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 176
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1882
          },
          "er": {
            "value": 3.96,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.99
          },
          "cpm": {
            "value": 31.3539,
            "value_from": 10.5214,
            "value_to": 105.2144,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "LapcNp5La48",
        "title": "NASA's SpaceX Crew-7 Mission to the Space Station (Official Trailer)",
        "description": "An international crew is preparing to launch to the International Space Station aboard NASA’s SpaceX Crew-7 mission.\n\nNASA astronaut Jasmin Moghbeli, ESA (European Space Agency) astronaut Andreas Mogensen, JAXA (Japan Aerospace Exploration Agency) astronaut Satoshi Furukawa, and cosmonaut Konstantin Borisov of Roscosmos will perform research technology demonstrations, science experiments, and maintenance activities aboard the microgravity laboratory.\n\nCrew-7 is targeted to launch no earlier than 3:27 a.m. EDT Saturday, Aug. 26 from Launch Complex 39A at Kennedy. As part of the agency’s Commercial Crew Program, Crew-7 marks the eighth human spaceflight mission supported by a SpaceX Dragon spacecraft and the seventh crew rotation mission to the space station since 2020 for NASA.\n\nYou can watch the launch live on NASA TV, NASA.gov, the NASA app, and right here on YouTube: https://youtube.com/live/QD2XDoeT8SI\n\n\nLearn more about the Crew-7 mission here: https://blogs.nasa.gov/crew-7/\n\nCredit: NASA\nVideo Producer: Sonnet Apple\nMusic: Universal Production Music",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/LapcNp5La48/hqdefault.jpg",
        "time_added": 1692576000,
        "time_added_iso": "2023-08-21T00:00:00",
        "metrics": {
          "views_count": {
            "value": 200518
          },
          "likes_count": {
            "value": 3118
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 63
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 3118
          },
          "er": {
            "value": 1.55,
            "mark": "fair"
          },
          "views_performance": {
            "value": 4.16
          },
          "cpm": {
            "value": 7.4308,
            "value_from": 2.4935,
            "value_to": 24.9354,
            "performance": {
              "7d": {
                "mark": "good"
              },
              "30d": {
                "mark": "very_good"
              },
              "90d": {
                "mark": "very_good"
              },
              "180d": {
                "mark": "good"
              },
              "365d": {
                "mark": "good"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "WL7sNgGDGvk",
        "title": "Where Are the Moon Rocks? We Asked a NASA Expert",
        "description": "Where are the Moon rocks from the Apollo missions kept? When they’re not being studied by institutions or enjoyed by museumgoers, NASA has a specialized Lunar Sample Curation Laboratory at NASA’s Johnson Space Center to store and keep these otherworldly samples safe. Studying these samples helps us learn more about the origin of not only our moon, but our planet. Deputy Apollo Sample Curator (Sept 2019 – Dec 2022) Dr. Juliane Gross explains more about lunar sample curation. \n\nProducers: Scott Bednar, Jessica Wilde\nEditor: David Shelton\n\nLink to download this video:  https://go.nasa.gov/3QK72Km\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/WL7sNgGDGvk/hqdefault.jpg",
        "time_added": 1692748800,
        "time_added_iso": "2023-08-23T00:00:00",
        "metrics": {
          "views_count": {
            "value": 48907
          },
          "likes_count": {
            "value": 1775
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 70
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1775
          },
          "er": {
            "value": 3.63,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.01
          },
          "cpm": {
            "value": 30.466,
            "value_from": 10.2235,
            "value_to": 102.2349,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "8_PlwfL5vi4",
        "title": "NASA Science Live: Psyche’s Journey to a Metal World (Official NASA Broadcast)",
        "description": "How did rocky planets form? We're launching a mission to find out.\n\nNASA’s Psyche spacecraft is preparing to lift off on Oct. 5 to embark on a 2.2-billion-mile journey to a unique metal-rich asteroid named Psyche. The mission could help us understand the early formation of rocky planets in our solar system, like Earth. \n\nJoin experts on Wednesday, Aug. 23, for an opportunity to learn more about Psyche. Submit your questions in the live chat using #AskNASA for a chance to have them answered live during the show.\n\nGet up to speed on this heavy metal mission: https://nasa.gov/psyche\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/8_PlwfL5vi4/hqdefault.jpg",
        "time_added": 1692748800,
        "time_added_iso": "2023-08-23T00:00:00",
        "metrics": {
          "views_count": {
            "value": 43889
          },
          "likes_count": {
            "value": 1660
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 3330
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1660
          },
          "er": {
            "value": 3.78,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.91
          },
          "cpm": {
            "value": 33.9493,
            "value_from": 11.3924,
            "value_to": 113.9238,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "QD2XDoeT8SI",
        "title": "NASA's SpaceX Crew-7 Launch (Official NASA Broadcast in 4K)",
        "description": "Watch live with us as a crew of four launch on NASA's SpaceX #Crew7 mission to the International Space Station. Liftoff is targeted at 3:27 a.m. EDT (0727 UTC), Sat., Aug. 26. \n\nCommander Jasmin Moghbeli of NASA, pilot Andreas Mogensen of the European Space Agency, and mission specialists Satoshi Furukawa of the Japan Aerospace Exploration Agency and Konstantin Borisov of Roscosmos will launch on their SpaceX Dragon spacecraft, powered by a Falcon 9 rocket, from Launch Complex 39A at NASA's Kennedy Space Center in Florida.\n \nVisit our Crew-7 blog for the latest mission news: https://blogs.nasa.gov/crew-7 \n \nOver 200 science experiments and technology demonstrations will take place during Crew-7's mission of approximately six months in space. Experiments will include the collection of microbial samples from the exterior of the space station, the first study of human response to different spaceflight durations, and an investigation of the physiological aspects of astronauts' sleep. Learn more about the mission and science at: https://www.nasa.gov/feature/what-you-need-to-know-about-nasa-s-spacex-crew-7-mission/ \n \nCredit: NASA\n\nThumbnail credit: NASA/Joel Kowsky",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/QD2XDoeT8SI/hqdefault.jpg",
        "time_added": 1692921600,
        "time_added_iso": "2023-08-25T00:00:00",
        "metrics": {
          "views_count": {
            "value": 1383360
          },
          "likes_count": {
            "value": 25885
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 16202
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 25885
          },
          "er": {
            "value": 1.87,
            "mark": "fair"
          },
          "views_performance": {
            "value": 28.69
          },
          "cpm": {
            "value": 1.0771,
            "value_from": 0.3614,
            "value_to": 3.6144,
            "performance": {
              "7d": {
                "mark": "excellent"
              },
              "30d": {
                "mark": "excellent"
              },
              "90d": {
                "mark": "excellent"
              },
              "180d": {
                "mark": "excellent"
              },
              "365d": {
                "mark": "excellent"
              },
              "all": {
                "mark": "excellent"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "9G8H7bND3F0",
        "title": "Our Webb Space Telescope Captures a Cosmic Ring on This Week @NASA – August 25, 2023",
        "description": "Our Webb Space Telescope captures a cosmic ring, the team behind our upcoming Psyche mission, and the unique thing about a star that was ripped apart by a black hole … a few of the stories to tell you about – This Week at NASA!\n\nLink to download this video: https://images.nasa.gov/details/NHQ_2023_0825_Our%20Webb%20Space%20Telescope%20Captures%20a%20Cosmic%20Ring%20on%20This%20Week%20@NASA%20%E2%80%93%20August%2025,%202023\n\nVideo Producer: Andre Valentine\nVideo Editor: Andre Valentine\nNarrator: Andre Valentine\nMusic: Universal Production Music\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/9G8H7bND3F0/hqdefault.jpg",
        "time_added": 1692921600,
        "time_added_iso": "2023-08-25T00:00:00",
        "metrics": {
          "views_count": {
            "value": 91709
          },
          "likes_count": {
            "value": 2527
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 159
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2527
          },
          "er": {
            "value": 2.76,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.9
          },
          "cpm": {
            "value": 16.247,
            "value_from": 5.452,
            "value_to": 54.5203,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "average"
              },
              "90d": {
                "mark": "average"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "sw54jZNypxg",
        "title": "Watch the \"Ring of Fire\" Solar Eclipse (NASA Broadcast Trailer)",
        "description": "On Oct. 14, 2023, a “ring of fire,” or annular, solar eclipse will travel from Oregon coast to the Gulf of Mexico. Weather permitting, most of the Americas will be able to view at least a partial solar eclipse. Click here to see the NASA 2023 and 2024 Solar Eclipse Map: https://go.nasa.gov/USEclipseMaps \n\nAn annular solar eclipse occurs when the Moon passes between the Sun and the Earth, but is just far away enough in its orbit that the Sun is not completely covered—creating a large, bright ring in the sky.\n\nWARNING: During an annular eclipse, it is never safe to look directly at the Sun without specialized eye protection designed for solar viewing. How to safely view an eclipse: https://solarsystem.nasa.gov/eclipses/2023/oct-14-annular/safety/\n\nNot in the path of the eclipse? Watch with us from anywhere in the world. We will provide live broadcast coverage on Oct. 14 from 11:30 a.m. to 1:15 p.m. EDT (1530-1715 UTC) on NASA TV, NASA.gov, the NASA app, and right here on YouTube: https://youtube.com/live/LlY79zjud-Q\n\nLearn more about the upcoming annular solar eclipse: https://solarsystem.nasa.gov/eclipses/2023/oct-14-annular/overview/\n\nDownload link: https://images.nasa.gov/details/Watch%20the%20Ring%20of%20Fire%20Solar%20Eclipse%20%28NASA%20Broadcast%20Trailer%29r\n\nCredit: NASA\nProducer: Sonnet Apple\nMusic: Universal Production Music",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/sw54jZNypxg/hqdefault.jpg",
        "time_added": 1693180800,
        "time_added_iso": "2023-08-28T00:00:00",
        "metrics": {
          "views_count": {
            "value": 114729
          },
          "likes_count": {
            "value": 2617
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 57
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2617
          },
          "er": {
            "value": 2.28,
            "mark": "fair"
          },
          "views_performance": {
            "value": 2.38
          },
          "cpm": {
            "value": 12.9871,
            "value_from": 4.3581,
            "value_to": 43.581,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "good"
              },
              "90d": {
                "mark": "average"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "nNVfoQoIKbo",
        "title": "The Science of NASA's SpaceX Crew-6 Mission",
        "description": "After launching to the International Space Station on March 2, 2023, NASA's SpaceX Crew-6 mission is wrapping up its time in orbit, with a return to Earth in early September 2023. \n\nNASA astronauts Stephen Bowen and Woody Hoburg, UAE (United Arab Emirates) astronaut Sultan Alneyadi, and Roscosmos cosmonaut Andrey Fedyaev spent their months on the orbiting lab conducting scientific investigations and technology demonstrations, including running a student robotic challenge, studying plant genetic adaptations to space, and monitoring human health in microgravity to prepare for exploration beyond low Earth orbit and to benefit life on Earth. \n\nThe astronauts also released Saskatchewan's first satellite, which tests a new radiation detection and protection system derived from melanin.\n\nLearn more: https://go.nasa.gov/3OOOR3l\n\nCredit: NASA \n\n#Crew6 #Science #SpaceStation",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/nNVfoQoIKbo/hqdefault.jpg",
        "time_added": 1693267200,
        "time_added_iso": "2023-08-29T00:00:00",
        "metrics": {
          "views_count": {
            "value": 63516
          },
          "likes_count": {
            "value": 1785
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 131
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1785
          },
          "er": {
            "value": 2.81,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.32
          },
          "cpm": {
            "value": 23.4587,
            "value_from": 7.872,
            "value_to": 78.7203,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "73WB4OUB1-4",
        "title": "Guy Bluford, First African American in Space: 40 Years of Inspiration",
        "description": "In 1983, NASA’s Guy Bluford broke barriers and made history as the first African American astronaut in space. Hear from Bluford himself, see footage from his Space Shuttle missions, and celebrate the milestones that forever changed the landscape of space exploration. \n\nBluford’s first mission was STS-8, which launched from Kennedy Space Center, Florida, on Aug. 30, 1983. This was the third flight for the Challenger orbiter, and the first mission with a night launch and night landing. During the mission, the STS-8 crew deployed the Indian National Satellite (INSAT-1B), operated the Canadian-built RMS with the Payload Flight Test Article (PFTA), operated the Continuous Flow Electrophoresis System (CFES) with live cell samples, conducted medical measurements to understand biophysiological effects of spaceflight, and activated four “Getaway Special” canisters. STS-8 completed 98 orbits of the Earth in 145 hours before landing at Edwards Air Force Base, California, on Sept. 5, 1983.\n\nMore on Guy Bluford: https://www.nasa.gov/subject/11054/guy-bluford/\n\nLink to download this video: \nhttps://images.nasa.gov/details/Guy%20Bluford,%20First%20African%20American%20in%20Space%2040%20Years%20of%20Inspiration\n\nProducer: Jori Kates\nEditor: Sonnet Apple\nMusic: Universal Production Music\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/73WB4OUB1-4/hqdefault.jpg",
        "time_added": 1693353600,
        "time_added_iso": "2023-08-30T00:00:00",
        "metrics": {
          "views_count": {
            "value": 38659
          },
          "likes_count": {
            "value": 1317
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 107
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1317
          },
          "er": {
            "value": 3.41,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.8
          },
          "cpm": {
            "value": 38.5421,
            "value_from": 12.9336,
            "value_to": 129.336,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "4KgAfNIYlns",
        "title": "OSIRIS-REx Asteroid Sample Return Mission Overview (Official NASA Briefing)",
        "description": "Experts from NASA’s OSIRIS-REx (Origins, Spectral Interpretation, Resource Identification, and Security–Regolith Explorer) mission give an overview on the asteroid sample capsule’s landing and recovery plans set for Sept. 24, 2023.\n\nNews conference participants are:\n\n•    Melissa Morris, OSIRIS-REx program executive, NASA Headquarters, Washington\n•    Dante Lauretta, OSIRIS-REx principal investigator, University of Arizona, Tucson\n•    Rich Burns, OSIRIS-REx project manager, NASA’s Goddard Space Flight Center, Greenbelt, Maryland\n•    Sandra Freund, OSIRIS-REx program manager, Lockheed Martin, Littleton, Colorado\n•    Kevin Righter, OSIRIS-REx deputy curation lead, NASA’s Johnson Space Center, Houston\n\nOn Sept. 24, the OSIRIS-REx spacecraft will approach Earth and release its sample return capsule into the atmosphere on a path to land at the Department of Defense’s Utah Test and Training Range. The event makes it the first U.S. asteroid sample return.\n\nThe touchdown will mark the end of a seven-year journey to explore asteroid Bennu, collect a sample from its surface, and deliver it to Earth for study. Scientists around the world will study the sample over the coming decades to learn about how our planet and solar system formed, as well as the origin of organics that may have led to life on Earth.\n\nAll about the mission: https://www.nasa.gov/osiris-rex\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/4KgAfNIYlns/hqdefault.jpg",
        "time_added": 1693353600,
        "time_added_iso": "2023-08-30T00:00:00",
        "metrics": {
          "views_count": {
            "value": 117295
          },
          "likes_count": {
            "value": 3344
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 3650
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 3344
          },
          "er": {
            "value": 2.85,
            "mark": "fair"
          },
          "views_performance": {
            "value": 2.43
          },
          "cpm": {
            "value": 12.703,
            "value_from": 4.2628,
            "value_to": 42.6276,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "good"
              },
              "90d": {
                "mark": "average"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "B3wzSUwl1tQ",
        "title": "A New Crew Heads to the Space Station on This Week @NASA – September 1, 2023",
        "description": "A new crew heads to the space station, a major storm spotted from space, and a robotic spacecraft enabling human missions to the Moon … a few of the stories to tell you about – This Week at NASA!\n\nLink to download this video:  https://images.nasa.gov/details/A%20New%20Crew%20Heads%20to%20the%20Space%20Station%20on%20This%20Week%20@NASA%20%E2%80%93%20September%201,%202023\n\nVideo Producer: Andre Valentine\nVideo Editor: Andre Valentine\nNarrator: Andre Valentine\nMusic: Universal Production Music\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/B3wzSUwl1tQ/hqdefault.jpg",
        "time_added": 1693526400,
        "time_added_iso": "2023-09-01T00:00:00",
        "metrics": {
          "views_count": {
            "value": 115118
          },
          "likes_count": {
            "value": 2184
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 162
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2184
          },
          "er": {
            "value": 1.9,
            "mark": "fair"
          },
          "views_performance": {
            "value": 2.39
          },
          "cpm": {
            "value": 12.9432,
            "value_from": 4.3434,
            "value_to": 43.4337,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "good"
              },
              "90d": {
                "mark": "average"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "X8n5OA1m5o8",
        "title": "NASA's SpaceX Crew-6 Mission Splashes Down (Official NASA Broadcast)",
        "description": "NASA astronauts Stephen Bowen and Woody Hoburg, UAE astronaut Sultan Alneyadi, and cosmonaut Andrey Fedyaev—the four members of NASA's SpaceX Crew-6 mission—are scheduled to splash down off the coast of Florida at 12:17 a.m. EDT (0417 UTC) on Monday, Sept. 4, concluding their six-month stay in low Earth orbit. \n\nJoin NASA and SpaceX for live coverage of Crew-6 and their Dragon Endeavour spacecraft from reentry through recovery. While aboard the International Space Station, Crew-6 contributed to a number of studies to help us learn how to live in space while making life better back on Earth: https://go.nasa.gov/3OOOR3l\n\nFollow the latest mission updates on our NASA blogs: https://blogs.nasa.gov/\n\nCredit: NASA\nThumbnail credit: NASA/Keegan Barber\n\n#NASA #SpaceX #Astronauts #Crew6",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/X8n5OA1m5o8/hqdefault.jpg",
        "time_added": 1693699200,
        "time_added_iso": "2023-09-03T00:00:00",
        "metrics": {
          "views_count": {
            "value": 963863
          },
          "likes_count": {
            "value": 17285
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 8530
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 17285
          },
          "er": {
            "value": 1.79,
            "mark": "fair"
          },
          "views_performance": {
            "value": 19.99
          },
          "cpm": {
            "value": 1.5459,
            "value_from": 0.5187,
            "value_to": 5.1875,
            "performance": {
              "7d": {
                "mark": "very_good"
              },
              "30d": {
                "mark": "excellent"
              },
              "90d": {
                "mark": "excellent"
              },
              "180d": {
                "mark": "very_good"
              },
              "365d": {
                "mark": "very_good"
              },
              "all": {
                "mark": "excellent"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "fwBBFmINkpw",
        "title": "Our SpaceX Crew-6 Mission Safely Returns to Earth on This Week @NASA – September 8, 2023",
        "description": "Our SpaceX Crew-6 mission safely returns to Earth, the tech demo hitching a ride on our Psyche spacecraft, and studying ancient life on Earth to better understand Mars … a few of the stories to tell you about – This Week at NASA!\n\nLink to download this video:\nhttps://images.nasa.gov/details/Our%20SpaceX%20Crew-6%20Mission%20Safely%20Returns%20to%20Earth%20on%20This%20Week%20@NASA%20%E2%80%93%20September%208,%202023\n\nVideo Producer: Andre Valentine\nVideo Editor: Andre Valentine\nNarrator: Andre Valentine\nMusic: Universal Production Music\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/fwBBFmINkpw/hqdefault.jpg",
        "time_added": 1694131200,
        "time_added_iso": "2023-09-08T00:00:00",
        "metrics": {
          "views_count": {
            "value": 62366
          },
          "likes_count": {
            "value": 2085
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 164
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2085
          },
          "er": {
            "value": 3.34,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.29
          },
          "cpm": {
            "value": 23.8912,
            "value_from": 8.0172,
            "value_to": 80.1719,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "Rs71YCXrXpg",
        "title": "Watch the \"Ring of Fire\" Solar Eclipse (NASA Broadcast Trailer)",
        "description": "On Oct. 14, 2023, a “ring of fire,” or annular, solar eclipse will travel from the Oregon coast to the Gulf of Mexico. Weather permitting, most of the Americas will be able to view at least a partial solar eclipse. Click here to see the NASA 2023 and 2024 Solar Eclipse Map: https://go.nasa.gov/USEclipseMaps \n\nAn annular solar eclipse occurs when the Moon passes between the Sun and the Earth, but is just far away enough in its orbit that the Sun is not completely covered—creating a large, bright ring in the sky.\n\nWARNING: During an annular eclipse, it is never safe to look directly at the Sun without specialized eye protection designed for solar viewing. How to safely view an eclipse: https://solarsystem.nasa.gov/eclipses/2023/oct-14-annular/safety/\n\nNot in the path of the eclipse? Watch with us from anywhere in the world. We will provide live broadcast coverage on Oct. 14 from 11:30 a.m. to 1:15 p.m. EDT (1530-1715 UTC) on NASA TV, NASA.gov, the NASA app, and right here on YouTube: https://youtube.com/live/LlY79zjud-Q\n\nLearn more about the upcoming annular solar eclipse: https://solarsystem.nasa.gov/eclipses/2023/oct-14-annular/overview/\n\nDownload link: https://images.nasa.gov/details/Watch%20the%20Ring%20of%20Fire%20Solar%20Eclipse%20%28NASA%20Broadcast%20Trailer%29r\n\nCredit: NASA\nProducer: Sonnet Apple\nMusic: Universal Production Music",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/Rs71YCXrXpg/hqdefault.jpg",
        "time_added": 1694476800,
        "time_added_iso": "2023-09-12T00:00:00",
        "metrics": {
          "views_count": {
            "value": 83126
          },
          "likes_count": {
            "value": 2207
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 58
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2207
          },
          "er": {
            "value": 2.65,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.72
          },
          "cpm": {
            "value": 17.9246,
            "value_from": 6.015,
            "value_to": 60.1497,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "average"
              },
              "90d": {
                "mark": "average"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "inSBC5U8KT4",
        "title": "Astronaut Frank Rubio Calls NASA Leadership From Space (Official NASA Broadcast)",
        "description": "Record-breaking astronaut Frank Rubio talks with NASA Administrator Bill Nelson and Deputy Administrator Pam Melroy about his historic mission during a space-to-ground call. On Sept. 11, 2023, Rubio surpassed the U.S. record for single longest duration spaceflight, a record previously set by astronaut Mark Vande Hei in 2022.\n\nRubio is set to return to Earth on Sept. 27, 2023, when he will have spent 371 days in space. His extended stay aboard the orbiting laboratory helps us see how the human body reacts to microgravity and informs future missions to deep space.\n\nCredit: NASA\nDownload link: https://images.nasa.gov/details-iss069m262561604_Expedition_69_NASA_Leadership_Interview_with_Astronaut_Frank_Rubio_23091",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/inSBC5U8KT4/hqdefault.jpg",
        "time_added": 1694563200,
        "time_added_iso": "2023-09-13T00:00:00",
        "metrics": {
          "views_count": {
            "value": 15693
          },
          "likes_count": {
            "value": 335
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 1248
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 335
          },
          "er": {
            "value": 2.13,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.33
          },
          "cpm": {
            "value": 94.9468,
            "value_from": 31.8613,
            "value_to": 318.6134,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "poor"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "zPHtJLt_rz4",
        "title": "NASA Joins Jane Goodall to Conserve Chimpanzee Habitats",
        "description": "Earth-observing satellites like Landsat have documented the shrinking of chimpanzee habitat, Africa's equatorial forest belt. The Jane Goodall Institute uses Landsat and other satellite data to empower local communities to drive conservation on their own land by creating habitat suitability maps for chimpanzees.\n\nMobile apps also bring in data in real-time so communities can protect their village forest reserves, and create land use plans for watersheds, people, and chimpanzees. After years of forest loss, the last few decades have seen habitats recovering.\n\nhttps://www.nasa.gov/image-feature/joining-jane-goodall-in-conserving-chimpanzee-habitats\n\nCredits:\nConservation dashboards created with support from NASA, The University of Maryland, Esri, Maxar, and the US Agency for International Development\nVideo footage Courtesy of Jane Goodall Institute/Lilian Pintea\n\n#Landsat #Earth #NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/zPHtJLt_rz4/hqdefault.jpg",
        "time_added": 1694563200,
        "time_added_iso": "2023-09-13T00:00:00",
        "metrics": {
          "views_count": {
            "value": 38475
          },
          "likes_count": {
            "value": 1295
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 489
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1295
          },
          "er": {
            "value": 3.37,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.8
          },
          "cpm": {
            "value": 38.7264,
            "value_from": 12.9955,
            "value_to": 129.9545,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "TQcqOW39ksk",
        "title": "Unidentified Anomalous Phenomena Independent Study Report",
        "description": "This media briefing is a discussion about the report published by the unidentified anomalous phenomena independent study team we commissioned in 2022.\n\nThe team’s report aims to inform us on what possible data could be collected in the future to shed light on the nature and origin of UAPs. Briefing participants include:\n\n· NASA Administrator Bill Nelson\n· Nicola Fox, associate administrator, Science Mission Directorate, NASA Headquarters in Washington\n· Dan Evans, assistant deputy associate administrator for research, NASA’s Science Mission Directorate\n· David Spergel, president, Simons Foundation and chair of NASA’s UAP independent study team\n\nThe UAP independent study team is a council of 16 community experts across diverse areas on matters relevant to potential methods of study for UAP. \n\nWe commissioned the nine-month study to examine UAP from a scientific perspective and create a roadmap for how to use data and the tools of science to move our understanding of UAP forward. Right now, the limited high-quality observations of UAP make it impossible to draw scientific conclusions from the data about the nature of such events.\n\nRead the report: https://go.nasa.gov/3PED0qv\nMore info on the independent study team, including frequently asked questions: https://science.nasa.gov/uap \n\nCredit: NASA\n\n#UAP",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/TQcqOW39ksk/hqdefault.jpg",
        "time_added": 1694649600,
        "time_added_iso": "2023-09-14T00:00:00",
        "metrics": {
          "views_count": {
            "value": 79919
          },
          "likes_count": {
            "value": 2422
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 3561
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2422
          },
          "er": {
            "value": 3.03,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.66
          },
          "cpm": {
            "value": 18.6439,
            "value_from": 6.2563,
            "value_to": 62.5633,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "average"
              },
              "90d": {
                "mark": "average"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "LyRIu-CYBdA",
        "title": "NASA Astronaut Loral O'Hara's First Launch to the Space Station (Official NASA Broadcast)",
        "description": "Astronaut Loral O'Hara, a member of NASA's 2017 astronaut candidate class, is set to launch on her first mission to space Friday, Sept. 15. O'Hara and Roscosmos cosmonauts Oleg Kononenko and Nikolai Chub will lift off from the Baikonur Cosmodrome in Kazakhstan aboard the Soyuz MS-24 spacecraft. \n\nThe Soyuz is scheduled to launch at 11:44 a.m. EDT (1544 UTC) Friday, Sept. 15. NASA TV coverage will begin at 10:45 a.m. After a two-orbit, three-hour journey, the Soyuz will dock to the International Space Station's Rassvet module at 2:56 p.m. (1856 UTC). O'Hara is scheduled to spend six months aboard the station while Kononenko and Chub are scheduled to spend a year on the orbital outpost.\n\nLearn more about Friday's launch: https://go.nasa.gov/3rlB1Oe\n\nCredit: NASA\n\n#NASA #ISS #Astronaut #RocketLaunch",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/LyRIu-CYBdA/hqdefault.jpg",
        "time_added": 1694736000,
        "time_added_iso": "2023-09-15T00:00:00",
        "metrics": {
          "views_count": {
            "value": 120840
          },
          "likes_count": {
            "value": 3618
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 4715
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 3618
          },
          "er": {
            "value": 2.99,
            "mark": "fair"
          },
          "views_performance": {
            "value": 2.51
          },
          "cpm": {
            "value": 12.3304,
            "value_from": 4.1377,
            "value_to": 41.377,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "good"
              },
              "90d": {
                "mark": "good"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "6g9_kyHTaYI",
        "title": "A New Long-Duration Spaceflight Record on This Week @NASA – September 15, 2023",
        "description": "A new long-duration spaceflight record, our SpaceX Crew-6 mission is back home, and our asteroid sample return mission is on target … a few of the stories to tell you about – This Week at NASA!\nLink to download this video: https://images.nasa.gov/details/A%20New%20Long-Duration%20Spaceflight%20Record%20on%20This%20Week%20@NASA%20%E2%80%93%20September%2015,%202023\n\nVideo Producer: Andre Valentine\nVideo Editor: Andre Valentine\nNarrator: Andre Valentine\nMusic: Universal Production Music\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/6g9_kyHTaYI/hqdefault.jpg",
        "time_added": 1694822400,
        "time_added_iso": "2023-09-16T00:00:00",
        "metrics": {
          "views_count": {
            "value": 64159
          },
          "likes_count": {
            "value": 1615
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 155
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1615
          },
          "er": {
            "value": 2.52,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.33
          },
          "cpm": {
            "value": 23.2236,
            "value_from": 7.7931,
            "value_to": 77.9314,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "ZSHnE8Pd5s4",
        "title": "Hispanic Heritage Month Greetings from Space",
        "description": "In celebration of Hispanic Heritage Month 2023, NASA astronaut Frank Rubio pays tribute to former NASA astronaut José Hernández and his inspirational life story with a message from aboard the International Space Station, orbiting 260 miles above Earth.\n\nHis message recognizes countless contributions made by other astronauts of Hispanic heritage like Ellen Ochoa, Franklin Chang-Diaz, and Joe Acaba. These pioneering explorers remind us that space needs to remain inclusive — a place for all to discover, explore, and inspire. \n\nFind out more about Jose Hernandez, and the true story behind the film “A Million Miles Away”:  \nhttps://www.nasa.gov/feature/nasa-contributes-to-film-detailing-life-of-astronaut-jos-hern-ndez\n\nTo learn more about American astronauts of Hispanic heritage, check out:\nhttps://www.nasa.gov/subject/16278/hispanic-heritage-month/\n\nMusic: Universal Production \nNASA TV Producer: Eric Galler\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/ZSHnE8Pd5s4/hqdefault.jpg",
        "time_added": 1694995200,
        "time_added_iso": "2023-09-18T00:00:00",
        "metrics": {
          "views_count": {
            "value": 29296
          },
          "likes_count": {
            "value": 1172
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 53
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1172
          },
          "er": {
            "value": 4,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.61
          },
          "cpm": {
            "value": 50.8602,
            "value_from": 17.0672,
            "value_to": 170.6718,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "poor"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "neZYcnduRTo",
        "title": "OSIRIS-REx: 1st US Asteroid Sample Lands Soon (Official NASA Trailer)",
        "description": "NASA’s Origins, Spectral Interpretation, Resource Identification, Security-Regolith Explorer (OSIRIS-REx) is the first U.S. mission to return samples from an asteroid to Earth.  When it lands, the OSIRIS-REx spacecraft will release the sample capsule for a safe landing in the Utah desert. The pristine material from Bennu – rocks and dust collected from the asteroid’s surface in 2020 – will offer generations of scientists a window into the time when the Sun and planets were forming about 4.5 billion years ago.\n \nWatch NASA’s live broadcast on NASA TV, NASA.gov, the NASA app, or on social media (@NASA) starting at 10 a.m. ET on Sunday, Sept. 24.\n\nSet a reminder: https://www.youtube.com/watch?v=Kdwyqctp908\n \nLearn more about OSIRIS-REx: https://www.nasa.gov/osiris-rex\n \nLink to download video:\nhttps://images.nasa.gov/details/OSIRIS-REx%201st%20US%20Asteroid%20Sample%20Lands%20Soon%20%28Official%20NASA%20Trailer%29\n\nMusic Credit: Universal Production Music\nVideo Producer: James Tralie\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/neZYcnduRTo/hqdefault.jpg",
        "time_added": 1694995200,
        "time_added_iso": "2023-09-18T00:00:00",
        "metrics": {
          "views_count": {
            "value": 170468
          },
          "likes_count": {
            "value": 2217
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 45
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2217
          },
          "er": {
            "value": 1.3,
            "mark": "fair"
          },
          "views_performance": {
            "value": 3.53
          },
          "cpm": {
            "value": 8.7406,
            "value_from": 2.9331,
            "value_to": 29.331,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "good"
              },
              "90d": {
                "mark": "good"
              },
              "180d": {
                "mark": "good"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "d6F9o6LKpVA",
        "title": "NASA Astronaut Frank Rubio: A Year of Science in Space",
        "description": "NASA astronaut Frank Rubio is set to return to Earth this fall after setting the record for the longest single spaceflight by a U.S. astronaut. He arrived at the International Space Station on Sept. 21, 2022, and will return home after 371 days in space. \n\nWhile on the orbiting lab, Rubio and his fellow crew members conducted dozens of scientific investigations and technology demonstrations. \n\nLearn more about Frank Rubio’s year-long scientific journey aboard the space station: https://go.nasa.gov/3LrwS29\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/d6F9o6LKpVA/hqdefault.jpg",
        "time_added": 1694995200,
        "time_added_iso": "2023-09-18T00:00:00",
        "metrics": {
          "views_count": {
            "value": 122108
          },
          "likes_count": {
            "value": 1575
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 160
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 1575
          },
          "er": {
            "value": 1.29,
            "mark": "fair"
          },
          "views_performance": {
            "value": 2.53
          },
          "cpm": {
            "value": 12.2023,
            "value_from": 4.0947,
            "value_to": 40.9474,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "good"
              },
              "90d": {
                "mark": "good"
              },
              "180d": {
                "mark": "good"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "bkIr9C4DzEA",
        "title": "Turning Science Fiction into Science Fact: NASA’s Innovative Advanced Concepts Program",
        "description": "NASA’s Innovative Advanced Concepts (NIAC) Program nurtures visionary ideas from America's innovators and entrepreneurs that could transform future NASA missions with the creation of radically better or entirely new aerospace concepts. NIAC projects study innovative, technically credible, advanced concepts to turn science fiction to science fact.\n \nFor more information about NIAC: https://www.nasa.gov/NIAC\n \nApply to NIAC link: https://www.nasa.gov/content/apply-to-niac\n \nMore NIAC videos: https://www.nasa.gov/directorates/stmd/niac/videos\n\nLink to download this video:\nhttps://images.nasa.gov/details/NASA%20NIAC%20Turning%20Science%20Fiction%20into%20Science%20Fact\n\nMore information about concepts included in this video:\n·       0:34 Lunar Crater Radio Telescope (LCRT): https://www.nasa.gov/directorates/spacetech/niac/2020_Phase_I_Phase_II/lunar_crater_radio_telescope/\n·       0:58 Super Ball Bot: https://www.nasa.gov/content/super-ball-bot\n·       1:00 Triton Hopper: https://www.nasa.gov/directorates/spacetech/niac/2018_Phase_I_Phase_II/Triton_Hopper/\n·       1:04 Contour Crafting: https://www.nasa.gov/directorates/spacetech/home/niac_countour_crafting.html\n·       1:08 Marsbee: https://www.nasa.gov/directorates/spacetech/niac/2018_Phase_I_Phase_II/Marsbee_Swarm_of_Flapping_Wing_Flyers_for_Enhanced_Mars_Exploration/\n·       1:10 Diffractive Solar Sailing: https://www.nasa.gov/directorates/spacetech/niac/2022/diffractive_solar_sailing/\n·       1:13 Solar Gravitational Lensing: https://www.nasa.gov/directorates/spacetech/niac/2020_Phase_I_Phase_II/Direct_Multipixel_Imaging_and_Spectroscopy_of_an_Exoplanet/\n·       1:17 Fluidic Telescope (FLUTE): https://www.nasa.gov/ames/flute\n·       1:30 On-demand Custom Spacesuits: https://www.nasa.gov/directorates/spacetech/niac/2022/Spacesuit_Digital_Thread/\n·       1:35 CubeSat Neutrino Detector: https://www.nasa.gov/directorates/spacetech/niac/2021_Phase_I/Cube_Sat_Space_Flight_Test_of_a_Neutrino_Detector/\n·       1:38 Lofted Environmental Venus Sensors (LEAVES): https://www.nasa.gov/directorates/spacetech/niac/2018_Phase_I_Phase_II/Lofted_Environmental_and_Atmospheric_Venus_Sensors/#:~:text=The%20LEAVES%20(Lofted%20Environmental%20and,planetary%20body%20with%20a%20prominent\n·       1:41 Myco-Architecture: https://www.nasa.gov/directorates/spacetech/niac/2021_Phase_I/Mycotecture_Off_Planet/\n·       1:44 Lunar Pit exploring Robots: https://www.nasa.gov/directorates/spacetech/niac/2019_Phase_I_Phase_II/robotic_technologies-enabling-the-exploration-of-lunar-pits/\n·       1:56 Bioinspired Ray (BREEZE): https://www.nasa.gov/directorates/spacetech/niac/2019_Phase_I_Phase_II/breeze/\n·       1:58 Independent Micro-swimmers (SWIM): https://www.nasa.gov/directorates/spacetech/niac/2022/SWIM/\n·       1:59 Light Bender: https://www.nasa.gov/directorates/spacetech/niac/2021_Phase_I/Light_Bender/\n·       2:01 Atmosphere and Cloud Sample Return: https://www.nasa.gov/directorates/spacetech/niac/2022/Venus_Atmosphere_and_Cloud_Particle_Sample_Return_for_Astrobiology/\n·       2:03 Optical Mining: https://www.nasa.gov/directorates/spacetech/niac/2019_Phase_I_Phase_II/Mini_Bee_Prototype/\n·       2:06 Nuclear Thermal Propulsion: https://www.nasa.gov/directorates/spacetech/niac/2023/New_Class_of_Bimodal/\n\nProducer, Writer, Editor: Shane Apple\nNarrator: Emanuel Cooper\nMusic: Universal Production Music\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/bkIr9C4DzEA/hqdefault.jpg",
        "time_added": 1695081600,
        "time_added_iso": "2023-09-19T00:00:00",
        "metrics": {
          "views_count": {
            "value": 75415
          },
          "likes_count": {
            "value": 2111
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 146
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2111
          },
          "er": {
            "value": 2.8,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.56
          },
          "cpm": {
            "value": 19.7573,
            "value_from": 6.63,
            "value_to": 66.2998,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "average"
              },
              "90d": {
                "mark": "average"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "d6wFRZoz8UE",
        "title": "Artemis II Astronauts Launch Day Demo",
        "description": "Train today, perform tomorrow. ⁣ \n⁣ \nOn September 20, 2023 the Artemis II astronauts practiced some of the pre-launch procedures they’ll perfect before their slated 2024 launch to the Moon.⁣ \n⁣ \nNASA Astronauts Reid Wiseman, Victor Glover, Christina Koch along with Canadian Space Agency astronaut Jeremy Hansen awoke at their crew quarters at NASA’s Kennedy Space Center and put on test versions of the Orion Crew Survival System spacesuits they will wear on launch day. They then departed to Launch Pad 39B in NASA’s new crew transportation fleet. ⁣ \n⁣ \nUpon arrival at the pad, the crew headed onto the mobile launcher and proceeded up the tower to the white room inside the crew access arm. There was no Orion spacecraft or Space Launch System rocket on the pad today, but on launch day this is where the crew will take their final Earth-bound steps prior to their journey around the Moon. ⁣ \n⁣ \nCredit: NASA⁣",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/d6wFRZoz8UE/hqdefault.jpg",
        "time_added": 1695168000,
        "time_added_iso": "2023-09-20T00:00:00",
        "metrics": {
          "views_count": {
            "value": 73363
          },
          "likes_count": {
            "value": 6222
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 56
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 6222
          },
          "er": {
            "value": 8.48,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.52
          },
          "cpm": {
            "value": 20.31,
            "value_from": 6.8154,
            "value_to": 68.1542,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "average"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "-VIM6LSRLIA",
        "title": "Tracking a Mission’s Historic Return to Earth on This Week @NASA – September 22, 2023",
        "description": "Tracking a mission’s historic return to Earth, a year of science onboard the space station, and the safe arrival of the station’s newest resident astronaut … a few of the stories to tell you about – This Week at NASA!\n\nLink to download this video:\nhttps://images.nasa.gov/details/Tracking%20a%20Mission%E2%80%99s%20Historic%20Return%20to%20Earth%20on%20This%20Week%20@NASA%20%E2%80%93%20September%2022,%202023\n\nVideo Producer: Andre Valentine\nVideo Editor: Andre Valentine\nNarrator: Andre Valentine\nMusic: Universal Production Music\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/-VIM6LSRLIA/hqdefault.jpg",
        "time_added": 1695427200,
        "time_added_iso": "2023-09-23T00:00:00",
        "metrics": {
          "views_count": {
            "value": 53449
          },
          "likes_count": {
            "value": 2022
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 156
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2022
          },
          "er": {
            "value": 3.78,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.11
          },
          "cpm": {
            "value": 27.877,
            "value_from": 9.3547,
            "value_to": 93.5471,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "Kdwyqctp908",
        "title": "OSIRIS-REx Asteroid Sample Return (Official 4K NASA Broadcast)",
        "description": "Watch a spacecraft deliver an asteroid sample to Earth! Our OSIRIS-REx (Origins, Spectral Interpretation, Resource Identification, and Security–Regolith Explorer) spacecraft is approaching Earth, and on Sept. 24, 2023, it will release its sample return capsule into the atmosphere on a path to land at the Department of Defense’s Utah Test and Training Range.\n\nThe touchdown will mark the end of a seven-year journey to explore asteroid Bennu, collect a sample from its surface, and deliver it to Earth as the U.S’s first pristine asteroid sample. Scientists around the world will study the sample over the coming decades to learn about how our planet and solar system formed, as well as the origin of organics that may have led to life on Earth.\n \nFor more information about OSIRIS-REx, visit https://solarsystem.nasa.gov/missions/osiris-rex/in-depth/\n \nCredit: NASA\n \n\n#NASA #Asteroid #Space #OSIRISREx",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/Kdwyqctp908/hqdefault.jpg",
        "time_added": 1695513600,
        "time_added_iso": "2023-09-24T00:00:00",
        "metrics": {
          "views_count": {
            "value": 1481450
          },
          "likes_count": {
            "value": 36876
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 12050
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 36876
          },
          "er": {
            "value": 2.49,
            "mark": "fair"
          },
          "views_performance": {
            "value": 30.72
          },
          "cpm": {
            "value": 1.0058,
            "value_from": 0.3375,
            "value_to": 3.3751,
            "performance": {
              "7d": {
                "mark": "excellent"
              },
              "30d": {
                "mark": "excellent"
              },
              "90d": {
                "mark": "excellent"
              },
              "180d": {
                "mark": "excellent"
              },
              "365d": {
                "mark": "excellent"
              },
              "all": {
                "mark": "excellent"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "92g5eiqb_fo",
        "title": "NASA Science Live: Ask Your Questions About OSIRIS-REx Asteroid Sample Delivery to Earth",
        "description": "On Sunday, Sept. 24, 2023, NASA’s OSIRIS-REx spacecraft safely delivered an estimated 8.8 ounces of rocky material collected from the surface of asteroid Bennu to Earth. The sample will be transported to NASA’s Johnson Space Center where it will be opened and studied. \n\nJoin us live on Tuesday, Sept. 26, as OSIRIS-REx mission experts recap the sample landing, preview what’s to come and answer your questions about the mission. Submit questions in the live chat.\n\nMore: https://blogs.nasa.gov/osiris-rex\n\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/92g5eiqb_fo/hqdefault.jpg",
        "time_added": 1695686400,
        "time_added_iso": "2023-09-26T00:00:00",
        "metrics": {
          "views_count": {
            "value": 46967
          },
          "likes_count": {
            "value": 2288
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 3695
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2288
          },
          "er": {
            "value": 4.87,
            "mark": "fair"
          },
          "views_performance": {
            "value": 0.97
          },
          "cpm": {
            "value": 31.7244,
            "value_from": 10.6458,
            "value_to": 106.4577,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "XAv2sKblPRc",
        "title": "Record-Setting Astronaut Frank Rubio Returns to Earth (Official NASA Broadcast)",
        "description": "Watch live as NASA astronaut Frank Rubio, the new record holder for the longest single U.S. spaceflight, returns home from the International Space Station. The Soyuz MS-23 spacecraft with Rubio and Roscosmos cosmonauts Sergey Prokopyev and Dmitri Petelin aboard is scheduled to land on the steppe of Kazakhstan on Wednesday, Sept. 27 at 7:17 a.m. EDT (1117 UTC).\n\nThe trio will return after 371 days in space and a mission spanning 157.4 million miles (253.3 million km) and 5,963 orbits of the Earth. Rubio became the new record holder for the longest single United States spaceflight on Sept. 11, after he surpassed the former record of 355 days held by NASA astronaut Mark Vande Hei.\n\nLearn about the highlights of Rubio's year in space: https://www.nasa.gov/mission_pages/station/research/news/frank-rubio-year-in-space/\n\nCredit: NASA\n\n#NASA #Astronaut #SpaceStation #ISS",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/XAv2sKblPRc/hqdefault.jpg",
        "time_added": 1695772800,
        "time_added_iso": "2023-09-27T00:00:00",
        "metrics": {
          "views_count": {
            "value": 202183
          },
          "likes_count": {
            "value": 3851
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 7475
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 3851
          },
          "er": {
            "value": 1.9,
            "mark": "fair"
          },
          "views_performance": {
            "value": 4.19
          },
          "cpm": {
            "value": 7.3696,
            "value_from": 2.473,
            "value_to": 24.7301,
            "performance": {
              "7d": {
                "mark": "good"
              },
              "30d": {
                "mark": "very_good"
              },
              "90d": {
                "mark": "very_good"
              },
              "180d": {
                "mark": "good"
              },
              "365d": {
                "mark": "good"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "M7KqDsykb3o",
        "title": "NASA’s Psyche Mission to a Metal-Rich Asteroid (Teaser Trailer)",
        "description": "There are millions of asteroids in our solar system, so why is NASA going to the asteroid Psyche? Scientists think this particular asteroid, which orbits the Sun between Mars and Jupiter, could be part of the metal-rich interior of a planetesimal, a building block of the rocky planets in our solar system. Visiting Psyche and studying it up close could help us understand how planets like Mercury, Venus, Earth, and Mars came to be. \n\nJoin us on the journey to the first metal-rich asteroid humankind has ever visited. The Psyche mission is set to launch as early as Oct. 12, 2023. Watch live launch commentary at https://www.youtube.com/nasa.\n\nLearn more about this first-of-its-kind mission at: https://www.nasa.gov/psyche/. \n\nCredit: NASA/JPL-Caltech/ASU\nProduced by: True Story Films",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/M7KqDsykb3o/hqdefault.jpg",
        "time_added": 1695859200,
        "time_added_iso": "2023-09-28T00:00:00",
        "metrics": {
          "views_count": {
            "value": 49418
          },
          "likes_count": {
            "value": 2222
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 45
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2222
          },
          "er": {
            "value": 4.5,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.02
          },
          "cpm": {
            "value": 30.151,
            "value_from": 10.1178,
            "value_to": 101.1777,
            "performance": {
              "7d": {
                "mark": "poor"
              },
              "30d": {
                "mark": "poor"
              },
              "90d": {
                "mark": "poor"
              },
              "180d": {
                "mark": "poor"
              },
              "365d": {
                "mark": "poor"
              },
              "all": {
                "mark": "average"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      },
      {
        "id": "5wjsVp3kDO8",
        "title": "Our First Asteroid Sample Return Mission is Back on Earth on This Week @NASA – September 29, 2023",
        "description": "Our first asteroid sample return mission is back on Earth, a record ride in space for a NASA astronaut, and our Artemis II mission is making prelaunch progress … a few of the stories to tell you about – This Week at NASA!\n\nLink to download this video:\nhttps://images.nasa.gov/details/Our%20First%20Asteroid%20Sample%20Return%20Mission%20is%20Back%20on%20Earth%20on%20This%20Week%20@NASA%20%E2%80%93%20September%2029,%202023\n\nVideo Producer: Andre Valentine\nVideo Editor: Andre Valentine\nNarrator: Andre Valentine\nMusic: Universal Production Music\nCredit: NASA",
        "strict_reason": null,
        "is_stricted": null,
        "thumbnail": "https://i.ytimg.com/vi/5wjsVp3kDO8/hqdefault.jpg",
        "time_added": 1695945600,
        "time_added_iso": "2023-09-29T00:00:00",
        "metrics": {
          "views_count": {
            "value": 91673
          },
          "likes_count": {
            "value": 2929
          },
          "dislikes_count": {
            "value": 0
          },
          "rating_value": {
            "value": 0
          },
          "length_sec": {
            "value": 153
          },
          "comments_count": {
            "value": 0
          },
          "engagement": {
            "value": 2929
          },
          "er": {
            "value": 3.2,
            "mark": "fair"
          },
          "views_performance": {
            "value": 1.9
          },
          "cpm": {
            "value": 16.2534,
            "value_from": 5.4542,
            "value_to": 54.5417,
            "performance": {
              "7d": {
                "mark": "average"
              },
              "30d": {
                "mark": "average"
              },
              "90d": {
                "mark": "average"
              },
              "180d": {
                "mark": "average"
              },
              "365d": {
                "mark": "average"
              },
              "all": {
                "mark": "good"
              }
            }
          }
        },
        "channel_ids": ["UCLA_DiR1FfKNvjuUpBHmylQ"]
      }
    ],
    "restTokens": 833,
    "validUntil": 1698487265
  }
}
```
