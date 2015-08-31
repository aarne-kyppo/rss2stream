/* exported molreader */
var molreader = angular.module('molreader', []);
molreader.controller('EntryController',function($scope){
  $scope.entries = [];
  $scope.rss_url = '';
  $scope.newItem = function(item)
  {
    console.log("update function called");
    $scope.$apply(function(){
      $scope.entries.unshift(item);
    });
  };

  var socket = io.connect(socketaddress + rooturl);
  //Closing channel before leaving the page.
  window.onbeforeunload = function(e){
    socket.emit('unsubscribe',{});
  }

  $scope.URLChanged = function()
  {
    if($scope.rss_url)
    {
      $scope.entries = [];
      $scope.entries.length = 0;
      socket.emit('subscribe',{url: $scope.rss_url});
    }
  }
  socket.on('newItem',function(data){
    console.log(data.item);
    $scope.newItem(data.item);
  });
});
