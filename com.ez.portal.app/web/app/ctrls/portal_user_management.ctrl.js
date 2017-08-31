/**
 * @author azaz.akhtar
 */
(function (ctx, fn) {
    'use strict';
    fn(ctx);
})(this, function (ctx) {
    'use strict';
    angular
        .module('portal_app')
        .controller('portal_user_management.ctrl', [
            '$scope',
            '$state',
            '$portalHttpService',
            'portal_util.fact',
            'toastr',
            function ($scope, $state, $portalHttpService, portalUtilFactory, messageToaster) {
                
            	var TOASTER_OWNER = 'User Manager';
            	var userTypeFactory = portalUtilFactory.getUserTypeFactory();
        		var entryStatusFactory = portalUtilFactory.getEntryStatusFactory();
        		var USER_TYPE = portalUtilFactory.getUserType();
        		var ENTRY_STATUS = portalUtilFactory.getEntryStatus();
            	
            	/**
                 * 
                 * */
            	$scope.init = function () {
            		$scope.USER_TYPE = USER_TYPE;
            		$scope.ENTRY_STATUS = ENTRY_STATUS;
            		$scope.isUserFormVisible = false;
            		$scope.user = {};
            		getAllUsers(function (users) {
            			if (users) {
            				initUsers(users);
            			}
            		});
            		$scope.userTypes = getUserTypes();
            		$scope.selectedUserType = $scope.userTypes[0];
                };
                
                /**
                 * 
                 * */
                $scope.reloadUsers = function (e) {
                	getAllUsers(function (users) {
            			if (users) {
            				initUsers(users);
            			}
            		});
                };
                
                /**
                 * 
                 * */
                $scope.removeUser = function (e, user) {
                	var userId = user.userId;
                	if (userId) {
                		removeUser(userId, function (restUsers, removedUsers) {
                			if (restUsers) {
                				initUsers(restUsers);
                			}
                		});
                	}
                };
                
                /**
                 * 
                 * */
                $scope.toggleBlockUser = function (e, user) {
                	var userId = user.userId, entryStatus = user.entryStatus;
                	if (userId) {
                		if (entryStatus == 'ACTIVE') {
                			blockUser(userId, function (restUsers, removedUsers) {
                				if (restUsers) {
                					initUsers(restUsers);
                				}
                			});
                		} else {
                			unblockUser(userId, function (restUsers, removedUsers) {
                				if (restUsers) {
                					initUsers(restUsers);
                				}
                			});
                		}
                	}
                };
            	
                /**
                 * 
                 * */
            	$scope.showUserForm = function () {
            		angular.forEach($scope.breadcrumbStack, function (breadcrumbStackItem, index) {
                    	breadcrumbStackItem.isActive = false;
                    });
            		$scope.breadcrumbStack.push({
                    	label: 'Create User',
                    	isActive: true
                    });
            		$scope.isUserFormVisible = true;
            	};
            	
            	/**
                 * 
                 * */
            	$scope.onChangeUserType = function (e, selectedUserType) {
            		$scope.user.userType = selectedUserType.typeKey * 1;
            	};
            	
            	/**
                 * 
                 * */
            	$scope.saveUser = function (e, user) {
            		if (user && user.emailId && user.username && user.userType) {
            			$portalHttpService
	                        .put($portalHttpService.Url.CREATE_USER, {
	                        	user: user
	                        })
	                        .then(function (response) {
	                            if (response && response.data && response.data.status) {
	                            	
	                            }
	                        });
            		}
            	};
            	
            	/**
                 * 
                 * */
            	function getAllUsers(cb) {
                	var users = [];
                	if (angular.isFunction(cb)) {
                		$portalHttpService
	                        .get($portalHttpService.Url.GET_ALL_USERS)
	                        .then(function (response) {
	                            if (response && response.data && response.data.status) {
	                            	arguments[0] = response.data.users;
	                            	cb.apply(this, arguments);
	                            	messageToaster.success(TOASTER_OWNER, 'User List refreshed');
	                            }
	                        });
                	}
                }
            	
            	function removeUser(userId, cb) {
            		if (userId) {
            			$portalHttpService
	                        .get($portalHttpService.Url.REMOVE_USER + userId)
	                        .then(function (response) {
	                            if (response && response.data && response.data.status) {
	                            	getAllUsers(cb);
	                            }
	                        });
            		}
            	}
            	
            	function blockUser(userId, cb) {
            		if (userId) {
            			$portalHttpService
            			.get($portalHttpService.Url.BLOCK_USER + userId)
            			.then(function (response) {
            				if (response && response.data && response.data.status) {
            					getAllUsers(cb);
            				}
            			});
            		}
            	}
            	
            	function unblockUser(userId, cb) {
            		if (userId) {
            			$portalHttpService
            			.get($portalHttpService.Url.UNBLOCK_USER + userId)
            			.then(function (response) {
            				if (response && response.data && response.data.status) {
            					getAllUsers(cb);
            				}
            			});
            		}
            	}
            	
            	/**
                 * 
                 * */
            	function initUsers(users) {
            		angular.forEach(users, function (user, index) {
            			user.userType = userTypeFactory[user.userType];
            			user.entryStatus = entryStatusFactory[user.entryStatus];
            		});
                	$scope.users = users;
                }
            	
            	/**
                 * 
                 * */
            	function getUserTypes() {
            		var userTypes = [];
            		angular.forEach(userTypeFactory, function (typeName, typeKey) {
            			if (typeKey != USER_TYPE.SUPER_USER && typeKey != USER_TYPE.FIRST_USER) {
            				userTypes.push({
            					typeName: typeName,
            					typeKey: typeKey
            				});
            			}
            		});
            		return userTypes;
            	}
            }
        ]);
});