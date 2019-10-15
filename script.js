'use strict';

let localStream = null;
let peer = null;
let existingCall = null;

// getUserMediaでデバイス情報を取得する。
navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(function (stream) {
        // Success
        $('#my-video').get(0).srcObject = stream;
        localStream = stream;
    }).catch(function (error) {
    // Error
    console.error('mediaDevice.getUserMedia() error:', error);
    return;
});

// Peerオブジェクトの作成。APIキーを指定する。
peer = new Peer({
    key: 'cb45992a-dba9-4913-9996-e1e7fb477af1',
    debug: 3
});

// Peer Openイベント
peer.on('open', function(){
    $('#my-id').text(peer.id);
});

// Peer Errorイベント
peer.on('error', function(err){
    alert(err.message);
});

// Peer Closeイベント
peer.on('close', function(){
});

// Peer 切断イベント
peer.on('disconnected', function(){
});

// 通話押下
$('#make-call').submit(function(e){
    e.preventDefault();
    // 相手のIDにローカルストリームを送る
    const call = peer.call($('#callto-id').val(), localStream);
    setupCallEventHandlers(call);
});

// 通話終了
$('#end-call').click(function(){
    existingCall.close();
});

// 着信が来た時の処理
peer.on('call', function(call){
	// ローカルストリームを返す
    call.answer(localStream);
    // 着信元の状態イベントハンドラ
    setupCallEventHandlers(call);
});

// 着信元の状態イベントハンドラ
function setupCallEventHandlers(call){
	// 着信済みだったらクローズ
    if (existingCall) {
        existingCall.close();
    };

    existingCall = call;

	// ストリームが来たらビデオ表示
    call.on('stream', function(stream){
        addVideo(call,stream);
        setupEndCallUI();
        $('#other-id').text(call.remoteId);
    });
    // 切れたらビデオ削除
    call.on('close', function(){
        removeVideo(call.remoteId);
        setupMakeCallUI();
    });
}

// ビデオ表示
function addVideo(call,stream){
    $('#other-video').get(0).srcObject = stream;
}

// ビデオ削除
function removeVideo(peerId){
    $('#'+peerId).remove();
}

// 初期UI表示
function setupMakeCallUI(){
    $('#make-call').show();
    $('#end-call').hide();
}

// 通話中UI表示
function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}