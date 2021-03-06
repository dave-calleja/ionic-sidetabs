angular.module('ionic-sidetabs', [])
  .directive('ionSideTabs', [function() {
      return {
          restrict: 'AE',
          transclude: true,
          template: '<ng-transclude></ng-transclude>',
          controllerAs: 'ionSideTabsCtrl',
          bindToController: true,
          scope: {
              onExpand: '&',
              onCollapse: '&'
          },
          controller: function() {
              var count = 0;
              this.addTab = function() {
                  return count++;
              };
          }
      }
  }])
  .directive('ionSideTab', ['$timeout', '$window', '$ionicPlatform', function($timeout, $window, $ionicPlatform) {
      return {
          restrict: 'AE',
          scope: true,
          transclude: true,
          template: '<ng-transclude></ng-transclude>',
          require: '?^ionSideTabs',
          controller: ['$scope', '$element', function($scope, $element) {
              var tabClass = document.querySelector('.tabs') ? (document.querySelector('.tabs-bottom') ? 'has-tabs' : 'has-tabs-top') : '',
                headerClass = document.querySelector('.bar-header') ? ' has-header' : '',
                posX = 0, lastPosX = 0, handleWidth = 0, isExpanded = false,
                expandedWidth;

              function init() {
                  $element.addClass('padding scroll-content ionic-scroll ' + tabClass + headerClass);
                  $element.css({transition: '300ms ease-in-out', overflow: 'visible', margin: '0 auto'});
                  computeWidths();
              }

              function computeWidths() {
                  expandedWidth = window.innerWidth;
                  lastPosX = expandedWidth;
                  $element.css({ width: expandedWidth + 'px', '-webkit-transform' : 'translate3d(' + lastPosX  + 'px, 0,  0)', transform : 'translate3d(' + lastPosX  + 'px, 0,  0)'});
              }

              function updateUI() {
                  $timeout(function() {
                    computeWidths();
                  }, 300);
              }

              this.setHandleWidth = function(width) {
                  handleWidth = width;
                  $element.css({'padding-right': width + 10 + 'px'});
              };

              this.onDrag = function(e) {
                  e.gesture.srcEvent.preventDefault();
                  e.gesture.preventDefault();

                  switch (e.type) {
                      case 'dragstart':
                          $element.css({transition:'none'});
                          break;
                      case 'drag':
                          posX = Math.round(e.gesture.deltaX) + lastPosX;
                          if (posX < handleWidth || posX > expandedWidth) return;
                          $element.css({'-webkit-transform': 'translate3d(' + posX + 'px, 0, 0)', transform: 'translate3d(' + posX + 'px, 0, 0)'});
                          break;
                      case 'dragend':
                          $element.css({transition: '300ms ease-in-out'});
                          lastPosX = posX;
                          break;
                  }
              };

              this.onTap = function(e) {
                  e.gesture && e.gesture.srcEvent.preventDefault();
                  e.gesture && e.gesture.preventDefault();

                  if (!isExpanded) {
                      lastPosX = handleWidth;
                    $scope.tab && $scope.tab.onExpand({ index: $scope.tab.index});
                  } else {
                      lastPosX = expandedWidth;
                    $scope.tab && $scope.tab.onCollapse({ index: $scope.tab.index});
                  }
                  $element.css({'-webkit-transform': 'translate3d(' + lastPosX + 'px, 0, 0)', transform: 'translate3d(' + lastPosX + 'px, 0, 0)'});

                  isExpanded = !isExpanded;
              };

              $ionicPlatform.ready(function() {
                  $window.addEventListener('orientationchange', updateUI);
                  $ionicPlatform.on("resume", updateUI);
              });

              init();
          }],
          link: function (scope, element, attrs, controller) {
              if (controller) {
                scope.tab = {
                  index: controller.addTab(),
                  onExpand: controller.onExpand,
                  onCollapse: controller.onCollapse
                };
              }
          }
      }
  }])
  .directive('ionSideTabHandle', ['$ionicGesture', function($ionicGesture) {
      return {
          restrict: 'AE',
          require: '^ionSideTab',
          link: function (scope, element, attrs, controller) {
              var height = parseInt(attrs.height, 10) || 50,
                width = parseInt(attrs.width, 10) || 40,
                toggleClasses = attrs.toggle;

              function onTap(e) {
                  controller.onTap(e);
                  element.find('i').toggleClass(toggleClasses);
              }

              element.css({
                  height: height + 'px',
                  width: width + 'px',
                  position: 'absolute',
                  left: '-' + width + 'px',
                  'z-index': '100',
                  //boxShadow: '0 1px #888',
                  display: 'flex',
                  display: '-webkit-flex',
                  '-webkit-align-items': 'center',
                  'align-items': 'center',
                  '-webkit-justify-content': 'center',
                  'justify-content': 'center'
              });
              controller.setHandleWidth(width);

              $ionicGesture.on('drag dragstart dragend', controller.onDrag, element);
              $ionicGesture.on('tap', onTap, element);

              scope.$parent.$watch ('tab.index', function(index) {
                  if (index==0) return;
                  var tabTop = index*height + 10;
                  element.css({top: tabTop + 'px'});
              });
          }
      }
  }]);
