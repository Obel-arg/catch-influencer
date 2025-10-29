Report
HypeAuditor For Instagram

Endpoint
Get the report of an Instagram account if it’s ready or requests the report if it’s not ready.

By username:
JSON

GET https://hypeauditor.com/api/method/auditor.report/?username={username}&features={featuresList}
By user_id:
JSON

GET https://hypeauditor.com/api/method/auditor.reportByUserId/?user_id={user_id}&features={featuresList}

Response Object
Attributes Type
report_state string Instagram report state
user object Instagram report data
report_state
String report_state identifies if the requested report is fully ready or lacks demographic data due to the low audience activity. List of report states:

Report state Description
READY Report is fully ready and contains all metrics
READY_LOW_CONFIDENCE Report lacks metrics demography_by_age, demography, audience_type, audience_geography
NOT_READY Report generation is still in progress
User Object
Attributes Type
username string blogger username
full_name string blogger name
is_private boolean privacy of account
is_verified boolean verified account
is_deleted boolean deleted account
about string account description
photo_url string avatar URL
posts_count int blogger posts count
followers_count int blogger followers count
followings_count int blogger followings count
avg_likes int average post likes
avg_comments int average comments likes
aqs int blogger AQS
aqs_name string blogger AQS name, ex. ‘Good’
aqs_description string blogger AQS description, ex. ‘Average activity, no suspicious likes or comments’
blogger_categories array List of blogger category ids, go to Taxonomy to get all available categories
blogger_languages array list of blogger languages in 2char format

blogger_hashtags
Object blogger_hashtags contains performance object. Object contains 3 periods of data: (30d for 30 days, 90d for 90 days, and 180d for 180 days). Each array of time period contains the following object:

Attributes Type
text string hashtag description
media_count int number of posts with hashtag
er_avg float average of ER
blogger_graph_anomalies
List of detected anomalies on followers and followings charts. Response contains description, description_followers and description_followings objects. Each object contains the following structure

Attributes Type
mark string mark description, ex. ‘Great’
title string title description, ex. ‘Organic’
description.title string title description, ex. ‘Organic’
description.description string anomaly description, ex. ‘No incentivized following patterns or negative trends detected on followers & following graphs.’
List of all possible anomalies:

Anomaly Title Description
FU_PATT_AG_NT Massfollowing patterns, abnormal growth and negative trend Massfollowing patterns, abnormal growth and negative trend detected on followers & following graphs, audience might be inauthentic.
FU_PATT_AG_NT_MORE_12M Massfollowing patterns, abnormal growth and negative trend more than 12 months ago Massfollowing patterns & abnormal growth detected on followers & following graphs, audience might be inauthentic. Also, negative trend detected on followers graph more than 12 months ago.
FU_PATT_AG Massfollowing patterns & abnormal growth Massfollowing patterns & abnormal growth detected on followers & following graphs, audience might be inauthentic.
FU_PATT_MORE_12M_AG_NT Massfollowing patterns more than 12 months ago, abnormal growth, & negative trend Abnormal growth & negative trend detected on followers graph, audience might be inauthentic. Also, Massfollowing patterns detected on following graph more than 12 months ago.
FU_PATT_MORE_12M_AG_NT_MORE_12M Massfollowing patterns & negative trend more than 12 months ago, abnormal growth Abnormal growth detected on followers graph, audience might be inauthentic. Also, Massfollowing patterns & negative trend detected on followers & following graphs more than 12 months ago.
FU_PATT_MORE_12M_AG Massfollowing patterns, abnormal growth, and negative trend Abnormal growth detected on followers graph, audience might be inauthentic. Also, Massfollowing patterns detected on following graph more than 12 months ago.
AG_NT Abnormal growth & negative trend Abnormal growth & negative trend detected on followers graph, audience might be inauthentic.
AG_NT_MORE_12M Negative trend more than 12 months ago. Abnormal growth Abnormal growth detected on followers graph, audience might be inauthentic. Also, negative trend detected on followers graph more than 12 months ago.
AG Abnormal growth Abnormal growth detected on followers graph, audience might be inauthentic.
FU_PATT_AG_MORE_12M_NT Abnormal growth more than 12 months ago, Massfollowing patterns, and negative trend Massfollowing patterns & negative trend detected on followers & following graphs, audience might be inauthentic. Also, abnormal growth detected on followers graph more than 12 months ago.
FU_PATT_AG_MORE_12M_NT_MORE_12M Abnormal growth & negative trend more than 12 months ago, Massfollowing patterns Massfollowing patterns detected on following graph, audience might be inauthentic. Also, abnormal growth & negative trend detected on followers graph more than 12 months ago.
FU_PATT_AG_MORE_12M Abnormal growth more than 12 months ago. Massfollowing patterns Massfollowing patterns detected on following graph, audience might be inauthentic. Also, abnormal growth detected on followers graph more than 12 months ago.
FU_PATT_MORE_12M_AG_MORE_12M_NT Massfollowing patterns & abnormal growth more than 12 months ago & negative trend Negative trend detected on followers graph, audience might be inauthentic. Also, Massfollowing patterns & abnormal growth detected on followers & following graphs more than 12 months ago.
FU_PATT_MORE_12M_AG_MORE_12M_NT_MORE_12M Massfollowing patterns, abnormal growth, and negative trend more than 12 months ago Massfollowing patterns, abnormal growth, and negative trend detected on followers & following graphs more than 12 months ago, audience might be inauthentic.
FU_PATT_MORE_12M_AG_MORE_12M Massfollowing patterns & abnormal growth more than 12 months ago Massfollowing patterns & abnormal growth detected on followers & following graphs more than 12 months ago, audience might be inauthentic.
AG_MORE_12M_NT Abnormal growth more than 12 months ago & negative trend Negative trend detected on followers graph, audience might be inauthentic. Also, abnormal growth detected on followers graph more than 12 months ago.
AG_MORE_12M_NT_MORE_12M Abnormal growth & negative trend more than 12 months ago Abnormal growth & negative trend detected on followers graph more than 12 months ago, audience might be inauthentic.
AG_MORE_12M Abnormal growth more than 12 months ago Abnormal growth detected on followers graph more than 12 months ago, audience might be inauthentic.
FU_PATT_NT Massfollowing patterns & negative trend Massfollowing patterns & negative trend detected on followers & following graphs, audience might be inauthentic.
FU_PATT_NT_MORE_12M Negative trend more than 12 months ago & Massfollowing patterns Massfollowing patterns detected on following graph, audience might be inauthentic. Also, negative trend detected on followers graph more than 12 months ago.
FU_PATT Massfollowing patterns Massfollowing patterns detected on following graph, audience might be inauthentic.
FU_PATT_MORE_12M_NT Massfollowing patterns more than 12 months ago & negative trend Negative trend detected on followers graph, audience might be inauthentic. Also, Massfollowing patterns detected on following graph more than 12 months ago.
FU_PATT_MORE_12M_NT_MORE_12M Massfollowing patterns & negative trend more than 12 months ago Massfollowing patterns & negative trend detected on followers & following graphs more than 12 months ago, audience might be inauthentic.
FU_PATT_MORE_12M Massfollowing patterns more than 12 months ago Massfollowing patterns detected on following graph more than 12 months ago, audience might be inauthentic.
NT Negative trend Negative trend detected on followers graph, audience might be inauthentic.
NT_MORE_12M Negative trend more than 12 months ago Negative trend detected on followers graph more than 12 months ago, audience might be inauthentic.
ORGANIC Organic No "incentivized following" patterns or negative trends detected on followers & following graphs.
Marks:

great
average
poor
blogger_geo
Attributes Type
country string blogger country in 2char form
state string blogger state
city string blogger city
blogger_emv
Attributes Type
emv int Earned Media Value (EMV)
emv_from int EMV start interval
emv_mark string mark description for EMV, ex. ‘poor’
emv_per_dollar float EMV per dollar
emv_similar float EMV similar accounts
emv_to int EMV finish interval
stories_emv int EMV for stories
stories_emv_from int EMV start interval for stories
stories_emv_to int EMV finish interval for stories
Marks

excellent
very_good
good
average
fair
poor
The EMV metric requires a blogger to have 12 posts with likes within the last 30 days to be calculated. If there are not enough posts or if they contain hidden likes, the metric will return an empty field.

blogger_reach
Attributes Type
reach int Estimated number of people who see a post created by this influencer.
reach_from int Reach start interval
reach_to int Reach finish interval
stories_reach int Estimated number of people who see a story created by this influencer.
stories_reach_from int Story reach start interval
stories_reach_to int Story reach finish interval
impressions int Average number of times people have seen an influencer’s content over the last 12 posts.
The blogger_reach metric requires a blogger to have 12 posts with likes within the last 30 days to be calculated. If there are not enough posts or if they contain hidden likes, the metric will return an empty field.

blogger_prices
Attributes Type
post_price int Estimated price for a post created by this influencer
post_price_from int Post price start interval
post_price_to int Post price finish interval
stories_price int Estimated price for a story created by this influencer
stories_price_from int Story post price start interval
stories_price_to int Story post price finish interval
cpe float Cost Per Engagement
cpe_from float CPE start interval
cpe_to float CPE finish interval
cpe_mark string Mark description for CPE, ex. ‘poor’
cpe_similar float CPE similar accounts
Marks

excellent
very_good
good
average
fair
poor
The blogger_prices metric requires a blogger to have 12 posts with likes within the last 30 days to be calculated. If there are not enough posts or if they contain hidden likes, the metric will return an empty field.

brand_safety
Is this blogger safe for brand, object like

Attributes Type
score int score based on criteria values from 0 to 9, 0 is safe blogger
mark string Description of brand safety score
items.{criteria}.value bool Is this criteria found in blogger content/comments
Marks

POSITIVE if the attribute score is 0
NEUTRAL if the attribute score is less than 2
NEGATIVE if the attribute score is equal to or more than 2
blogger_rankings
Attributes Type
worldwide.rank int worldwide rank value
worldwide.delta int
country.rank int country rank value
country.country.id int country id from https://www.geonames.org
country.country.code string country in 2char form
country.country.title string country title
category.rank int category rank value
category.country.id int country id from https://www.geonames.org
category.country.code string country in 2char form
category.country.title string country title
category.category.id int category id, go to Taxonomy to get all available categories
category.category.title string title of category
likes_spread
Attributes Type
value float blogger likes spread
avg float similar bloggers average likes spread
title string ex., “Excellent”
If likes-related metrics returnnull, it means an influencer disabled likes count for their posts. We do not track hidden likes.

likes_comments_ratio
Attributes Type
value float blogger likes-comments ratio
avg float similar bloggers avg likes-comments ratio
title string ex., “Excellent”
If likes-related metrics returnnull, it means an influencer disabled likes count for their posts. We do not track hidden likes.

audience_reachability
Attributes Type
value float blogger audience reachability
avg float similar bloggers avg audience reachability
title string ex., “Excellent”
Marks for Title

Excellent
Very Good
Good
Average
Could be improved
Low
audience_authenticity
Attributes Type
value float blogger audience authenticity
avg float similar bloggers avg audience authenticity
title string ex., “Excellent”
audience_type
Attributes Type
real float prc of real audience
susp float prc of suspicious audience
infs float prc of influencers audience
mass float prc of mass followers audience
most_media
❗️
IMPORTANT

This metric has been deprecated since 31/05/2023. Please, refer to Account Media.

audience_ethnicity
Attributes Type
name string name of ethnicity group
value float prc of ethnicity group
audience_sentiments
Attributes Type
sentiments.POSITIVE.count int count of positive comments
sentiments.POSITIVE.prc float prc of positive comments
sentiments.NEUTRAL.count int count of neutral comments
sentiments.NEUTRAL.prc float prc of neutral comments
sentiments.NEGATIVE.count int count of negative comments
sentiments.NEGATIVE.prc float prc of negative comments
score int final score
comments_count int count of comments
posts_count int count of posts
likes_comments_ratio_chart
Array likes_comments_ratio_chart includes the 12 most recent posts likes/comments.

Attributes Type
x int
y int
followers_chart
Attributes Type
date int Unix timestamp in seconds
count int number of followers in a given date
following_chart
Attributes Type
date int Unix timestamp in seconds
count int number of following in a given date
er
❗️
IMPORTANT

The object er.hist is deprecated since 19/10/2023, thus the data is not updated. Please, refer to ER Benchmarks.

Object er contains performance object. Object contains 6 periods of data: (7d for 7 days, 30d for 30 days, 90d for 90 days, 180d for 180 days, 365d for 365 days and all).

Attributes Type
value float Blogger Engagement Rate, prc
avg float Similar bloggers average Engagement Rate
title string ex., “Excellent, compared to other brand accounts”
hist array Distribution of ER for similar accounts
hist.count int count of accounts
hist.min float min ER in group
hist.max float max ER in group
performance.{period}.value float value for given period
performance.{period}.value_prev float previous value for given period
performance.{period}.max float max ER for given period
performance.{period}.min. float min ER for given period
subscribers_growth_prc
Object subscribers_growth_prc contains performance object. Object contains 5 periods of data: (7d for 7 days, 30d for 30 days, 90d for 90 days, 180d for 180 days and 365d for 365 days). Each array of time period contains the following object:

Attributes Type
value float subscribers growth prc for given period
mark string mark description, ex. "average"
mark_title string mark title description, ex. "average"
similar float value for similar accounts
Marks & Mark Title

excellent
good
average
fair
poor
comments_rate
Attributes Type
value float comments rate value
avg float average value
title string mark, ex. ‘excellent’
audience_languages
Attributes Type
data array array of {code: string, value: float} objects. Code is ISO 639-1, and value the prc.
audience_age_21_plus_prc
Attributes Type
value float adult audience percent
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
1 instagram
2 youtube
3 tiktok
4 twitch
5 twitter
7 snapchat
audience_education
Attributes Type
no_education float prc of audience without education
incomplete_primary float prc of audience with incomplete primary education
primary float prc of audience with primary education
lower_secondary float prc of audience with lower secondary education
upper_secondary float prc of audience with upper secondary education
post_secondary float prc of audience with post secondary education
audience_marital_status
Attributes Type
single float prc of single audience
married float prc of married audience
widowed float prc of widowed audience
divorced float prc of divorced audience
media_per_week
❗️
IMPORTANT

The object media_per_week has added to Endpoint since 08/12/2023.

Attributes Type
value float count of media per week
mark string mark, ex. ‘excellent’
Marks

excellent
very_good
good
average
fair
poor
growth
Growth analysis

Attributes Type
title string mark, ex. ‘Organinc’
description string description of the growth analysis, ex. "No "incentivized following" patterns or negative trends detected on followers & following graphs.”
audience_geography
Attributes Type
countries array array of {name: string, code: string, value: float} objects. Code is ISO 3166 two letters country code. United Kingdom is uk.
states array array of {name: string, value: float} objects.
cities array array of {name: string, value: float, id: int} objects. ID from https://www.geonames.org
audience_interests
Attributes Type
data array array of [0: string, 1: float] objects, where 0 is the category name and 1 the category weight.
est_reach
Estimated reach

Attributes Type
from int start interval
to int final interval
yearly_growth
Attributes Type
value float prc of yearly growth
avg float similar bloggers average Yearly Growth prc
title string ex., “Excellent”
advertising_data
🚧
Info!

Please note that the metric is only returned if the account has ad posts; otherwise, it will be absent.

Attributes Type
avg_ad_er float average advertising ER
avg_er_display array array of {0: string, 1: string} objects, where 0 and 1 are marks (mark & Title correspondingly):
poor ; Low
excellent ; High
good ; Normal
ad_posts.count float count of advertising posts
ad_posts.prc float prc of advertising posts
ad_posts.display array array of {0: string, 1: string} objects, where 0 and 1 are marks (mark & Title correspondingly):
poor ; High
fair; Average
good ; Normal
all_posts.count int count of all posts
all_posts.display array array of {0: string, 1: string} objects, where 0 and 1 are marks (mark & Title correspondingly):
poor ; High
good ; Above_average
great ; Average
good ; Below_average
fair; Low
brand_mentions_count int count of brand mentions
brands_categories array array of objects strings
regular_posts.count int count of regular posts
regular_posts.display array array of {0: string, 1: string} objects, where 0 and 1 are marks (mark & Title correspondingly):
poor; High
good ; Good
great ; Excellent
fair ; Low
brand_mentions array array of {username:string, name: string, avatar: string, mentions_count: int, mention_er: float, category: string} objects.
Username is brand username,
name is brand name,
avatar is link to brand avatar,
mentions_count is number of times brand was mentioned by influencer,
mentions_er is number of times brand was mentioned by influencer,
category is brand category
brand_categories_html string description of brand categories
avg_er float average ER
post_frequency
Attributes Type
value float number of posts per week
location
Attributes Type
value string blogger location - country, city
demography_by_age
Array

Attributes Type
gender string male or female
value float percent of the gender group
by_age_group array array of {group: string, value: float} objects, where gender is the gender group, and value is the prc.
demography
Attributes Type
gender string “F” for female or “M” for male
value float percent of the gender group
contact_details
Attributes Type
emails array array of strings
phones array array of strings
audience_income
Audience Yearly Household Income

Attributes Type
0k - 5k float
5k - 10k float
10k - 25k float
25k - 50k float
50k - 75k float
75k - 100k float
100k - 150k float
150k - 200k float
200k+ float
est_post_price
Estimated post price

Attributes Type
min int start interval
max int finish interval
est_stories_price
Estimated story price

Attributes Type
min int start interval
max int finish interval
geo_quality
Attributes Type
code string
title string
Features Object (optional)
For access to report additional features you need to specify features parameter in the request

Feature Response field
ranking features.ranking Ranking data for specified channel.
mentions features.content Influencer mentions
mentioned_by features.report Influencers that mentioned this account last 90 days.
notable_audience features.report Influencers that have recently interacted (liked or commented) with this account.
audience_brand_affinity features.report A list of brands the influencer’s audience engages with
er_benchmarks features.report ER Benchmarks
er_benchmarks
ER Benchmarks include historical data for ER Tiers (data.tiers), ER Countries (data.countries), ER Category Labels (data.labels).

Attributes Type
data.tiers.mark string ER mark. E.g.: average
data.tiers.similar float ER value for similar accounts
data.tiers.hist array of objects array of {count: int, min: float, max: float} objects.
count is number of accounts,
min is min ER value,
max is max ER value.
data.countries.hist array of objects array of {mark: string, similar: float, id: int, code: string, er: float, min: float, max: float, count: int} objects.
mark is ER mark,
similar is ER value for similar accounts,
id is ISO 3166 two letters country code,
code is country two letters code,
er is ER value,
min is min ER value,
max is max ER value,
count is number of accounts.
data.labels.hist array of objects array of {mark: string, similar: float, id: int, er: float, min: float, max: float, count: int} objects.
mark is ER mark,
similar is ER value for similar accounts,
id is category label,
er is ER value,
min is min ER value,
max is max ER value,
count is number of accounts.
Marks
