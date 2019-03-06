微信小程序前端开发问题集
1.小程序自带底部tab栏不支持自定义样式？
   可以不用自带的tab栏，通过导航的形式自定义和配置tab。
   参考实例：微信小程序自定义tabBar组件开发(https://blog.csdn.net/qq_29729735/article/details/78933721)

2.当页面有textarea文本输入框，又需要弹窗时，解决textarea层级最高的问题:
   显示弹窗时隐藏textarea (wx:if 或 hidden,看需要取舍)

3.ios中，textarea聚焦容易将自带标题栏顶下来，处理方法：
    textarea有个adjust-position (键盘弹起时，是否自动上推页面)属性，前端判断如果是iOS就将此属性设为false，适当调节页面高度保证键盘不盖住输入框；安卓手机可将此属性设为true，再加上cursor-spacing(指定光标与键盘的距离，单位 px 。取 textarea 距离底部的距离和 cursor-spacing 指定的距离的最小值作为光标与键盘的距离), 可保证页面流畅性。(关于textarea文本输入详见官方文档：小程序textarea组件 https://developers.weixin.qq.com/miniprogram/dev/component/textarea.html)

4.关于输入框字符计算的问题：
   a.textarea默认最大输入长度maxlength为140个字符(一个汉字或一个英文字母都算作一个字符)，maxlength设置为 -1 的时候不限制最大长度.
   b.实际开发中，字数是按字节计算(一个汉字=2个英文字母)，计算方式：
   strlen(str) {
     var len = 0;
     for (var i=0; i<str.length; i++) {
       let c = str.charCodeAt(i);
       //单字节加1
       if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
          len = len+1;
       } else {
          len = len+2;
       }
    }
   return len;
 }
5.关于小程序分享，两种方式：
  a.分享给好友或者群，onShareAppMessage函数，可自定义转发内容，具体查看文档：小程序分享onShareAppMessage(https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html#%E9%A1%B5%E9%9D%A2%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%E5%87%BD%E6%95%B0)
  b.分享朋友圈，官方并未开放分享朋友圈接口，目前业界的方式是保存海报让用户手动发朋友圈，两种方式生成海报：
     |. 前端使用canvas画图生成海报，调试复杂，实例参考：微信小程序实现生成海报并且保存本地(https://www.cnblogs.com/zzgyq/p/8882995.html)
     ||. 通过后台生成海报，前端处理方便
     |||. Painter （小程序生成图片库，通过 json 方式绘制一张可以发到朋友圈的图片）

6.点击按钮请求接口，点多次会请求多次,会造成同一操作创建多条记录，阻止方法：
   点击一次后将按钮状态设为disabled.

7.当列表数据很多时，加载更多:
    onReachBottom(生命周期事件：监听用户上拉触底)
8.wx.navigateTo 无法跳转页面，原因可能是：
   a. 一个应用同时只能打开5个页面，当已经打开了5个页面之后，wx.navigateTo不能正常打开新页面。请避免多层级的交互方式，或者使用wx.redirectTo
   b. 跳转tabbar需使用wx.switchTab().

9.本地资源无法通过css获取：
     background-image：可以使用网络图片，或者 base64，或者使用<image/>标签

10.页面间数据传递：
     微信小程序路由（页面跳转）是通过API wx.navigateTo或者wxml中<navigator/>组件实现的，不管哪种实现都会有一个重要的参数就是url，它指定了要跳转的页面，并且页面之间数据传递也是通过url来实现的，这个数据传递有点类似于我们使用的get网络请求，把参数都拼接在要跳转界面地址的后面并以“？”连接。然后将要传入的数据以键和值的形式追加在”?”后面，多个参数直接用”&”符合。

11.微信小程序如何自定义顶部导航栏？
    设置 window 配置项中的 navigationStyle 为 custom 。custom 模式可自定义导航栏，只保留右上角胶囊状的按钮，其它都需要自定义（包括标题及返回键）。


12.如何在小程序上复制文本
     对指定要复制的文本使用text标签，并设置 selectable属性为true, 如：
     <text selectable="true">复制我复制我复制我复制我</text>

13.微信小程序授权问题：如果拒绝授权，短时间内微信不会重新调起授权框让用户重新授权。
     处理方案：1.判断用户授权操作，如果拒绝，弹出确认框提示用户“将无法正常使用小程序，建议删除小程序重新进入或者手动授权，是否手动授权？”，用户点击确定，跳到设置界面，手动授权，用户点击取消，跳到取消授权页面（需自己开发）

14.new Date跨平台兼容性问题
     在Andriod使用new Date(“2018-05-30 00:00:00”)木有问题，但是在ios下面识别不出来。
因为IOS下面不能识别这种格式，需要用2018/05/30 00:00:00格式。可以使用正则表达式对做字符串替换，将短横替换为斜杠。var iosDate= date.replace(/-/g, '/');。

15.wx.getUserInfo()接口更改问题
     现在授权方式是需要引导用户点击一个授权按钮，然后再弹出授权。
      解法：微信小程序不支持wx.getUserInfo授权的解决方法(http://caibaojian.com/wx-getuserinfo.html)
            getUserInfo兼容解决方案(https://developers.weixin.qq.com/community/develop/doc/000aacd65388b86a44c69fd9a52804)

16.Array比较好用的属性和方法
      Array.isArray() 方法用来判断某个值是否为Array。如果是，则返回 true，否则返回 false。
      concat() 方法将传入的数组或非数组值与原数组合并,组成一个新的数组并返回.
      forEach() 方法对数组的每个元素执行一次提供的函数(回调函数)。
      join() 方法将数组中的所有元素连接成一个字符串。
      keys() 方法返回一个数组索引的迭代器。
      map() 方法返回一个由原数组中的每个元素调用一个指定方法后的返回值组成的新数组
      pop() 方法删除一个数组中的最后的一个元素，并且返回这个元素。
      push() 方法添加一个或多个元素到数组的末尾，并返回数组新的长度（length 属性值）。
      toString() 返回一个字符串，表示指定的数组及其元素。

17.关于toast提示
      微信小程序的 API 默认是支持toast的。 但是wx.showToast(OBJECT)方法的弹层却是默认带有一个icon。可以配置success、loading、none，也可自定义图标，通过image配置，可设置是否显示透明蒙层，防止触摸穿透，默认：false，详细配置可查看官方文档：微信官方toast设置(https://developers.weixin.qq.com/miniprogram/dev/api/wx.showToast.html)

18. bindtap和catchtap的区别
    bind事件绑定不会阻止冒泡事件向上冒泡，catch事件绑定可以阻止冒泡事件向上冒泡

19.tabBar设置不显示
     tabBar不显示，原因有很多，最常见的有以下几种：
     1、tabBar写法错误导致的不显示，将其中的大写字母B写成小写，导致tabBar不显示。。
     2、tabBar的list中没有写pagePath字段，或者pagePath中的页面没有注册。
     3、tabBar的list的pagePath指定的页面没有写在注册页面第一个。微信小程序的逻辑是”pages”中的第一个页面是首页，也就是程序启动后第一个显示的页面，如果tabBar的list的pagePath指定的页面都不是pages的第一个，当然也就不会电视tabBar了。
     4、tabBar的数量低于两项或者高于五项，微信官方中明确规定tabBar的至少两项最多五项。超过或者少于都不会显示tabBar。

20. 小程序 自定义弹窗后禁止屏幕滚动（滚动穿透）
     弹出 fixed 弹窗后，在弹窗上滑动会导致下层的页面一起跟着滚动， 两张解决方法：
     1. 在弹出层加上 catchtouchmove 事件
      <view class="modal-view" hidden="{{!showModal}}" bindtap="toggleModal" catchtouchmove="preventTouchMove">
        <view class="modal">
          <view class="modal-item" catchtap="makePhoneCall">{{site.phone}}</view>
          <view class="modal-item" catchtap="toggleModal">取消</view>
      </view>
    </view>

    Pages({
        preventTouchMove() {}
    })
    2. 给catchtouchmove="ture"
     <view class="modal-view" hidden="{{!showModal}}" bindtap="toggleModal" catchtouchmove="ture">
         <view class="modal">
            <view class="modal-item" catchtap="makePhoneCall">{{site.phone}}</view>
            <view class="modal-item" catchtap="toggleModal">取消</view>
        </view>
    </view>

21. 小程序无法加载html标签(现在可以用rich-text组件，但是对图片很不友好)，同时数据渲染也无法渲染wxml标签（<view></view>等），可以使用wxParse.js来处理相关数据。
22. 小程序同一个页面获取高度有时不同，解决方法：
   在onready周期函数里面获取高度，onload不行

23. 小程序实现图片lazy-load懒加载方法
  1. image组件自带有lazy-load属性（只针对page与scroll-view下的image有效），设为true即可，作用不大
  2. 通过滚动监听（onPageScroll）每个图片高度值是否小于滚动条高度，从而改变图片的显示，实例：小程序实现图片懒加载

24. 小程序的10层跳转限制怎么破？
  解决方案：
  判断一下当前页面长度是否达到10级，达到10级用redirectTo，未达到用navigateTo
    var jumpUrl = function (data) {
     let pages = getCurrentPages();
     if (pages.length >= 10) {
       wx.redirectTo({
         url: data
       })
     } else {
       wx.navigateTo({
         url: data
       })
     }
   }

25. 获取时间戳方法：
   1.Date.parse(new Date())    2.(new Date()).valueOf()   3.new Date().getTime()   4.Date.now()

26. 字符串时间与时间戳转换
    1.Date.parse(标准字符串时间)   2.new Date(时间戳)

27. CSS多行多列元素布局：
   display: flex;justify-content: space-between;flex-flow: row wrap;

28. 小程序强制更新
   const updateManager = wx.getUpdateManager();
   updateManager.onCheckForUpdate(function (res) {
       // 请求完新版本信息的回调
      console.log(res.hasUpdate);
   })
   updateManager.onUpdateReady(function () {
     // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
     updateManager.applyUpdate()
  })
 updateManager.onUpdateFailed(function () {
   // 新版本下载失败
 })

29. 小程序互跳需在app.json配置跳转小程序appid, 数组形式，“navigateToMiniProgramAppIdList”：[xx1,xx2...], 最多可跳转10个小程序
30. swiper禁止手动滑动：
    swiper上面加一个透明的蒙层~

31. 图片设置为圆角，会快速从方形闪烁一下:
   解决方法：给父元素设置圆角，或者给图片添加透明边框

32. 小程序image标签选择大图片的时候，图片会变形
    原因: 小程序的image标签会自带宽高  320 * 240

    解决方法：设置一下 mode = “widthFix”  就可以 变成原图片的宽高比例

33. 用ES6Promise对象对wx.request进行封装
//wx.request请求数据
  requestData(method, url, data, header) {
    if (!url || !method) return;
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: data || {},
        header: header || {},
        method: method.toLocaleUpperCase(),
        success: function (res) {
          resolve(res);
        },
        fail: function (res) {
          reject(res.errMsg || '发送网络错误(http fail)');
        }
      });
    });
  }
34. view 添加点击效果： <view hover hover-class="item-hover">
35. 小程序码长按识别跳转页面，前端处理：
    获取onload方法中options.scene参数即可，然后跳转到对应页面。
     当scene有多个参数时，需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
     let scene = decodeURIComponent(options.scene);
     //&是我们定义的参数链接方式
    let scenes = options.scene.split("&");   //scenes即为参数数组
    let a = scenes[0];
    let b = scenes[1];
    ...

36. 小程序获取用户手机号(button的open-type属性)：
    <button  open-type="getPhoneNumber"  bindgetphonenumber="getPhoneNumber"></button>，getPhoneNumber拿到的是加密过的数据，需要通过后台解密，返回给前端可见的数据。

37. 区分用户手机是安卓系统还是苹果系统：
    wx.getSystemInfo({
        success: (res) => {
           // res.platform (ios，android)
         }
    })

38.判断页面是否是通过分享的卡片打开的？
   app.js中onLoad方法获取scene，scene为1007或1008即是分享卡片打开的页面

39. 小程序富文本解析组件wxParse: wxParse富文本解析组件
40. formid收集
    可以通过模板消息向小程序用户发送消息，前提是我们得获取到openid和formid。用户登录我们即可获取到用户openid。而只要用户有点击行为，我们即可获取到formid。
    可以给每个button都包上form标签，只要用户有点击行为都可以收集到formid.
     <form bindsubmit="formSubmit" report-submit='true'> <button formType="submit">点击</button></fformorm>

41. 保存图片到系统相册，两种方法：
    1. 调用微信图片预览API，长按保存即可
    2. 调用API: wx.saveImageToPhotosAlbum（调用前需要 用户授权 scope.writePhotosAlbum）
