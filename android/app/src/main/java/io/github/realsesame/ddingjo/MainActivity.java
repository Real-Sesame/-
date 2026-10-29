package io.github.realsesame.ddingjo;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.security.MessageDigest;

/**
 * 띵조 AUTO TEAM MAKER 앱: 사이트(https://real-sesame.github.io/-/)를 전체 화면으로 엽니다.
 * - 사이트가 바뀌면 앱도 바로 바뀜(앱 업데이트 없이). 로그인하면 브라우저와 설정이 같이 맞춰짐.
 * - 다른 주소(공식 공지 · 자료실 링크 등)는 휴대폰 브라우저로 엶.
 * - 사이트의 파일 저장(편성 이미지 · 설정 백업)은 window.DdingjoApp.saveFile로 받아 '다운로드' 폴더에 저장.
 * - 인터넷이 끊기면 assets/offline.html을 보여 주고 다시 시도할 수 있게 함.
 * 보안: 이 사이트(https) · 앱 안의 오프라인 화면만 앱 안에서 열고, 앱 기능(window.DdingjoApp)은 그 화면에서만 동작.
 *       휴대폰 파일 · 다른 앱의 데이터에는 접근하지 않고, http(암호화 안 된 연결)는 막음.
 */
public class MainActivity extends Activity {
    static final String HOST = "real-sesame.github.io";
    static final String HOME = "https://" + HOST + "/-/";
    static final String OFFLINE = "file:///android_asset/offline.html";
    WebView web;
    boolean offline = false;
    /** 지금 화면에 열린 주소(앱 기능을 부른 화면이 이 사이트인지 확인용) */
    volatile String pageUrl = "";

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#141413"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#141413"));
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        // Android 15부터 화면이 상태 표시줄 뒤까지 그려지므로, 시스템 바 높이만큼 비워 둠
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int l, t, r, b;
            if (Build.VERSION.SDK_INT >= 30) {
                // 카메라 구멍(폴드 바깥 · 안쪽 화면) · 키보드도 피함
                android.graphics.Insets i = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                l = i.left; t = i.top; r = i.right; b = i.bottom;
            } else {
                l = insets.getSystemWindowInsetLeft(); t = insets.getSystemWindowInsetTop(); r = insets.getSystemWindowInsetRight(); b = insets.getSystemWindowInsetBottom();
            }
            v.setPadding(l, t, r, b);
            return insets;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        // 휴대폰 파일 · 다른 앱 데이터 접근 끔(앱 안 오프라인 화면 file:///android_asset은 그대로 열림)
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setGeolocationEnabled(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (Build.VERSION.SDK_INT >= 26) s.setSafeBrowsingEnabled(true);
        applyTextZoom();
        s.setUserAgentString(s.getUserAgentString() + " DdingjoApp/" + BuildConfigCompat.versionName(this) + " (" + BuildConfigCompat.versionCode(this) + ")");
        web.addJavascriptInterface(new Bridge(), "DdingjoApp");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (isOurs(u)) return false;
                openOutside(u);
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (req.isForMainFrame() && isOurs(req.getUrl())) {
                    offline = true;
                    view.loadUrl(OFFLINE);
                }
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
                pageUrl = url == null ? "" : url;
            }

            @Override
            public void doUpdateVisitedHistory(WebView view, String url, boolean reload) {
                pageUrl = url == null ? "" : url;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (url != null && url.startsWith("https://")) offline = false;
            }
        });
        web.setDownloadListener((url, ua, cd, mime, len) -> openOutside(Uri.parse(url)));

        // 뒤로 가기: Android 13+는 새 방식(OnBackInvokedCallback) — Android 16(대상 SDK 36)부터는 onBackPressed가 불리지 않음
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::goBack);
        }

        if (saved != null) web.restoreState(saved);
        else web.loadUrl(startUrl(getIntent()));
    }

    /** 휴대폰 글자 크기 설정을 따르되 85~115%로 제한(폴드 바깥 화면처럼 좁은 화면에서 배치가 깨지지 않게) */
    void applyTextZoom() {
        float fs = getResources().getConfiguration().fontScale;
        web.getSettings().setTextZoom(Math.round(Math.max(85f, Math.min(115f, fs * 100f))));
    }

    /** 접기 · 펼치기 · 화면 회전 · 글자 크기 변경: 앱을 다시 만들지 않고 화면만 다시 맞춤(보던 화면 · 입력 그대로) */
    @Override
    public void onConfigurationChanged(Configuration c) {
        super.onConfigurationChanged(c);
        applyTextZoom();
        web.requestApplyInsets();
    }

    String startUrl(Intent it) {
        Uri d = it != null ? it.getData() : null;
        return (d != null && isOurs(d)) ? d.toString() : HOME;
    }

    @Override
    protected void onNewIntent(Intent it) {
        super.onNewIntent(it);
        Uri d = it.getData();
        if (d != null && isOurs(d)) web.loadUrl(d.toString());
    }

    static boolean isOurs(Uri u) {
        if (u == null) return false;
        if (OFFLINE.equals(u.toString())) return true; // 앱 안의 오프라인 화면만(다른 file:// 주소는 안 됨)
        String sch = u.getScheme();
        return "https".equals(sch) && HOST.equals(u.getHost()) && u.getPath() != null && u.getPath().startsWith("/-");
    }

    void openOutside(Uri u) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, u));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "열 수 있는 앱이 없습니다", Toast.LENGTH_SHORT).show();
        }
    }

    /** 사이트 안에서 이전 화면으로, 더 갈 곳이 없으면(또는 오프라인 화면이면) 앱 닫기 */
    void goBack() {
        if (!offline && web.canGoBack()) web.goBack();
        else finish();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() { goBack(); } // Android 12 이하

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    protected void onPause() { web.onPause(); super.onPause(); }

    /** 앱 기능을 부른 화면이 이 사이트(또는 앱 안 오프라인 화면)인지 */
    boolean trusted() {
        try { return isOurs(Uri.parse(pageUrl)); } catch (Exception e) { return false; }
    }

    static final java.util.Set<String> MIMES = new java.util.HashSet<>(java.util.Arrays.asList(
        "image/png", "image/jpeg", "image/webp", "application/json", "text/plain", "text/csv"));

    /** 사이트에서 부르는 기능: window.DdingjoApp.xxx() — 이 사이트 화면에서만 동작 */
    class Bridge {
        /** base64 데이터를 '다운로드' 폴더에 저장(최대 약 20MB). 성공하면 저장한 위치, 실패하면 빈 문자열 */
        @JavascriptInterface
        public String saveFile(String b64, String name, String mime) {
            if (!trusted() || b64 == null || b64.length() > 28_000_000) return "";
            if (name == null || name.isEmpty()) name = "ddingjo";
            if (name.length() > 80) name = name.substring(0, 80);
            if (mime == null || !MIMES.contains(mime)) mime = "application/octet-stream";
            try {
                byte[] data = Base64.decode(b64, Base64.DEFAULT);
                String safe = name.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_").replaceAll("^\\.+", "_");
                String where;
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                    v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                    v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/띵조");
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    if (uri == null) return "";
                    try (OutputStream os = getContentResolver().openOutputStream(uri)) { os.write(data); }
                    where = "다운로드/띵조/" + safe;
                } else {
                    File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "");
                    if (!dir.exists()) dir.mkdirs();
                    File f = new File(dir, safe);
                    try (FileOutputStream os = new FileOutputStream(f)) { os.write(data); }
                    where = f.getAbsolutePath();
                }
                final String msg = where;
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "저장: " + msg, Toast.LENGTH_SHORT).show());
                return where;
            } catch (Exception e) {
                return "";
            }
        }

        /** 텍스트 공유(카톡 등) */
        @JavascriptInterface
        public void shareText(String text) {
            if (!trusted() || text == null) return;
            final String t = text.length() > 4000 ? text.substring(0, 4000) : text;
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, t);
                startActivity(Intent.createChooser(i, "공유"));
            });
        }

        @JavascriptInterface
        public String version() { return BuildConfigCompat.versionName(MainActivity.this); }

        @JavascriptInterface
        public void reload() { if (trusted()) runOnUiThread(() -> { offline = false; web.loadUrl(HOME); }); }

        /** 이 앱의 서명 인증서 SHA-256 지문(사이트의 앱 페이지에서 공식 앱인지 확인할 때 씀) */
        @JavascriptInterface
        public String signer() {
            try {
                PackageManager pm = getPackageManager();
                Signature[] sigs;
                if (Build.VERSION.SDK_INT >= 28) {
                    PackageInfo pi = pm.getPackageInfo(getPackageName(), PackageManager.GET_SIGNING_CERTIFICATES);
                    sigs = pi.signingInfo.getApkContentsSigners();
                } else {
                    PackageInfo pi = pm.getPackageInfo(getPackageName(), PackageManager.GET_SIGNATURES);
                    sigs = pi.signatures;
                }
                byte[] d = MessageDigest.getInstance("SHA-256").digest(sigs[0].toByteArray());
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < d.length; i++) { if (i > 0) sb.append(':'); sb.append(String.format("%02X", d[i])); }
                return sb.toString();
            } catch (Exception e) {
                return "";
            }
        }
    }
}
