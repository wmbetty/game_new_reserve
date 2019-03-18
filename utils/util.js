
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// const http = `https://fabu.aide.604f.cn/v1/`
const http = `https://aide.79643.com/v1/`
const loginApi = `${http}member/login`
const bannerApi = `${http}banner?access-token=`
const newsListApi = `${http}news?access-token=`
const newestApi = `${http}news/newest?access-token=`
const gameListApi = `${http}game?access-token=`
const newsDetailApi = `${http}news/`
const gameDetailApi = `${http}game/`
const gameRolesApi = `${http}game/role?access-token=`
const allStrategyApi = `${http}strategy?access-token=`
const strategyApi = `${http}strategy/top?access-token=`
const strategyPraiseApi = `${http}strategy/praise?access-token=`
const strategyNewestApi = `${http}strategy/newest?access-token=`
const strategyViewApi = `${http}strategy/view?access-token=`
const praiseApi = `${http}comment/praise?access-token=`
const updateUserInfoApi = `${http}member/user-info?access-token=`
const userApi = `${http}member?access-token=`
const commentListApi = `${http}comment?access-token=`
const uploadImgApi = `${http}strategy/upload-images?access-token=`
const phoneNumberApi = `${http}member/phone-number`
const activityRecommendApi = `${http}activity/recommend?access-token=`
const activityViewApi = `${http}activity/view?access-token=`
const activityListApi =`${http}activity?access-token=`
const activityParticipateApi = `${http}activity/participate?access-token=`
const rewardDataApi = `${http}reward?access-token=`
const rewardLotteryApi =`${http}reward/lottery?access-token=`
const rewardInviteApi = `${http}reward/invite?access-token=`
const phoneReserveApi = `${http}task/make?access-token=`
const questionApi = `${http}reward/answer?access-token=`
const invitePosterApi = `${http}activity/generate?access-token=`
const reserveElementsApi = `${http}elements?access-token=`
const gameGeaturesApi = `${http}features?access-token=`
const rulesApi = `${http}activity/rule?access-token=`
const ladderApi = `${http}ladder?access-token=`
const successApi = `${http}activity/success?access-token=`
const sourceApi = `${http}member/source?access-token=`

module.exports = {
  formatTime: formatTime,
  loginApi: loginApi,
  bannerApi: bannerApi,
  newsListApi: newsListApi,
  newestApi: newestApi,
  gameListApi: gameListApi,
  newsDetailApi: newsDetailApi,
  gameDetailApi: gameDetailApi,
  gameRolesApi: gameRolesApi,
  strategyApi: strategyApi,
  strategyNewestApi: strategyNewestApi,
  strategyViewApi: strategyViewApi,
  allStrategyApi: allStrategyApi,
  praiseApi: praiseApi,
  updateUserInfoApi: updateUserInfoApi,
  commentListApi: commentListApi,
  uploadImgApi: uploadImgApi,
  userApi: userApi,
  strategyPraiseApi: strategyPraiseApi,
  phoneNumberApi: phoneNumberApi,
  activityRecommendApi: activityRecommendApi,
  activityViewApi: activityViewApi,
  activityListApi: activityListApi,
  activityParticipateApi: activityParticipateApi,
  rewardDataApi: rewardDataApi,
  rewardLotteryApi: rewardLotteryApi,
  rewardInviteApi: rewardInviteApi,
  phoneReserveApi: phoneReserveApi,
  questionApi: questionApi,
  invitePosterApi: invitePosterApi,
  reserveElementsApi: reserveElementsApi,
  gameGeaturesApi: gameGeaturesApi,
  rulesApi: rulesApi,
  ladderApi: ladderApi,
  successApi: successApi,
  sourceApi: sourceApi
}
