import { Linking, ActionSheetIOS, Alert, Platform } from 'react-native';

function openDialog(urls) {
  if (Platform.OS === 'ios') {
    urls = urls.ios;
    return Promise.all(urls.map(element => Linking.canOpenURL(element[1])))
      .then((results) => {
        return urls.filter((element, index) => results[index]);
      }).then(choices => {
        // 系统内没有任何地图, 推荐下载一个
        if (choices.length < 1) {
          return Alert.alert(
            '',
            '您没有安装任何地图',
            [
              {text: '确定', onPress: () => {}},
              ],
            { cancelable: false }
          )
        }

        const oprionts = (choices.map(element => element[0]))
        let data = []
        choices.map((element, index) => {
          data.push({
            text: element[0],
            onPress: () => Linking.openURL(element[1])
          })
        })
        return Alert.alert(
          '选择地图',
          '',
          [...data, {text: '取消', onPress: () => {}],
          { cancelable: true }
        )
        return
        ActionSheetIOS.showActionSheetWithOptions({
          options: [...oprionts, '取消'],
          cancelButtonIndex: choices.length,
          title: '选择地图',
        }, buttonIndex => {
          if (buttonIndex < choices.length) {
            Linking.openURL(choices[buttonIndex][1]);
          }
        });
      });
  } else if (Platform.OS === 'android') {
    urls = urls.android;
    return Promise.all(urls.map(element => Linking.canOpenURL(element[1])))
      .then((results) => {
        return urls.filter((element, index) => results[index]).map(url => ({
          text: url[0],
          onPress: () => {
            Linking.openURL(url[1]);
          },
        }));
      }).then(choices => {
        // 系统内没有任何地图, 推荐下载一个
        if (choices.length < 1) {
          return Alert.alert('选择地图', '您还没有安装地图软件。', [
            { text: '下载高德地图', onPress: () => Linking.openURL('http://mobile.amap.com') },
            { text: '下载百度地图', onPress: () => Linking.openURL('http://map.baidu.com') },
            { text: '取消' }
          ]);
        }

        return Alert.alert('选择地图', '请选择一个地图打开', [...choices, { text: '取消' }]);
      });
  }
}

export default {
  options: { appName: 'MapLinking' },

  setOptions(opts) {
    this.options = { ...this.options, ...opts };
  },

  /**
   * 在地图上标注指定位置
   *
   * @param location 位置, {lat:40, lng: 118, type: 'gcj02'}
   * @param title    标题
   * @param content  内容
   */
  markLocation(location, title, content) {
    return openDialog({
      android: [
        [
          '使用高德地图打开',
          `androidamap://viewMap?sourceApplication=${this.options.appName}&poiname=${title}&lat=${location.lat}&lon=${location.lng}&dev=${location.type === 'gcj02' ? '0' : '1'}`,
        ],
        [
          '使用百度地图打开',
          `bdapp://map/marker?location=${location.lat},${location.lng}&coord_type=${location.type === 'gcj02' ? 'gcj02' : 'wgs84'}&title=${title}&content=${content}&src=${this.options.appName}`,
        ]
      ],
      ios: [
        [
          '使用高德地图打开',
          `iosamap://viewMap?sourceApplication=${this.options.appName}&poiname=${title}&lat=${location.lat}&lon=${location.lng}&dev=${location.type === 'gcj02' ? '0' : '1'}`,
        ],
        [
          '使用百度地图打开',
          `baidumap://map/marker?location=${location.lat},${location.lng}&coord_type=${location.type === 'gcj02' ? 'gcj02' : 'wgs84'}&title=${title}&content=${content}&src=${this.options.appName}`,
        ],
        [
          '使用iOS系统地图打开',
          `http://maps.apple.com/?ll=${location.lat},${location.lng}&q=${title}`,
        ],
      ],
    });
  },

  /**
   * 规划线路
   *
   * @param srcLocation  起始位置: {lat:40, lng: 118, title: '起点'}
   * @param distLocation 目的位置: {lat:40, lng: 118, type: 'gcj02', title: '终点'}
   * @param mode         交通方式: drive - 驾车, bus - 公交, walk - 步行
   */
  planRoute(srcLocation, distLocation, mode) {
    return openDialog({
      android: [
        [
          '使用高德地图规划路线',
          `androidamap://route?sourceApplication=${this.options.appName}&slat=${srcLocation && srcLocation.lat}&slon=${srcLocation && srcLocation.lng}&sname=${srcLocation && srcLocation.title}&dlat=${distLocation.lat}&dlon=${distLocation.lng}&dname=${distLocation.title}&dev=${distLocation.type === 'gcj02' ? '0' : '1'}&m=0&t=${mode === 'drive' ? '2' : (mode === 'bus' ? '1' : '4')}`,
        ],
        [
          '使用百度地图规划路线',
          `bdapp://map/direction?origin=${srcLocation ? (srcLocation.lat + ',' + srcLocation.lng) : ''}&destination=${distLocation.lat},${distLocation.lng}&mode=${mode === 'drive' ? 'driving' : (mode === 'bus' ? 'transit' : 'walking')}&coord_type=${distLocation.type === 'gcj02' ? 'gcj02' : 'wgs84'}&src=${this.options.appName}`,
        ]
      ],
      ios: [
        [
          '使用高德地图规划路线',
          `iosamap://path?sourceApplication=${this.options.appName}&slat=${srcLocation && srcLocation.lat}&slon=${srcLocation && srcLocation.lng}&sname=${srcLocation && srcLocation.title}&dlat=${distLocation.lat}&dlon=${distLocation.lng}&dname=${distLocation.title}&dev=${distLocation.type === 'gcj02' ? '0' : '1'}&t=${mode === 'drive' ? '0' : (mode === 'bus' ? '1' : '2')}`,
        ],
        [
          '使用百度地图规划路线',
          `baidumap://map/direction?origin=${srcLocation ? (srcLocation.lat + ',' + srcLocation.lng) : ''}&destination=${distLocation.lat},${distLocation.lng}&mode=${mode === 'drive' ? 'driving' : (mode === 'bus' ? 'transit' : 'walking')}&coord_type=${distLocation.type === 'gcj02' ? 'gcj02' : 'wgs84'}&src=${this.options.appName}`,
        ],
        [
          '使用iOS系统地图规划路线',
          `http://maps.apple.com/?ll=${distLocation.lat},${distLocation.lng}&q=${distLocation.title}&dirflg=${mode === 'drive' ? 'd' : (mode === 'bus' ? 'r' : 'w')}`,
        ],
      ],
    });
  },

  /**
   * 启动导航
   *
   * @param distLocation 目的位置: {lat:40, lng: 118, type: 'gcj02', title: '终点'}
   */
  navigate(distLocation) {
    return openDialog({
      android: [
        [
          '使用高德地图导航',
          `androidamap://navi?sourceApplication=${this.options.appName}&poiname=${distLocation.title}&lat=${distLocation.lat}&lon=${distLocation.lng}&dev=${distLocation.type === 'gcj02' ? '0' : '1'}`,
        ],
        [
          '使用百度地图导航',
          `bdapp://map/direction?origin=&destination=${distLocation.lat},${distLocation.lng}&mode=driving&coord_type=${distLocation.type === 'gcj02' ? 'gcj02' : 'wgs84'}&src=${this.options.appName}`,
        ]
      ],
      ios: [
        [
          '使用高德地图导航',
          `iosamap://navi?sourceApplication=${this.options.appName}&poiname=${distLocation.title}&lat=${distLocation.lat}&lon=${distLocation.lng}&dev=${distLocation.type === 'gcj02' ? '0' : '1'}`,
        ],
        [
          '使用百度地图导航',
          `baidumap://map/direction?origin=&destination=${distLocation.lat},${distLocation.lng}&mode=driving&coord_type=${distLocation.type === 'gcj02' ? 'gcj02' : 'wgs84'}&src=${this.options.appName}`,
        ],
        [
          '使用iOS系统地图导航',
          `http://maps.apple.com/?ll=${distLocation.lat + ',' + distLocation.lng}&q=${distLocation.title}&dirflg=d`,
        ],
      ],
    });
  },
};
