package io.github.realsesame.ddingjo;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
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

/**
 * 띵조 AUTO TEAM MAKER 앱: 사이트(https://real-sesame.github.io/-/)를 전체 화면으로 엽니다.
 * - 사이트가 바뀌면 앱도 바로 바뀜(앱 업데이트 없이). 로그인하면 브라우저와 설정이 같이 맞춰짐.
 * - 다른 주소(공식 공지 · 자료실 링크 등)는 휴대폰 브라우저로 엶.
 * - 사이트의 파일 저장(편성 이미지 · 설정 백업)은 window.DdingjoApp.saveFile로 받아 '다운로드' 폴더에 저장.
 * - 인터넷이 끊기면 assets/offline.html을 보여 주고 다시 시도할 수 있게 함.
 */
public class MainActivity extends Activity {
    static final String HOST = "real-sesame.github.io";
    static final String HOME = "https://" + HOST + "/-/";
    WebView web;
    boolean offline = false;

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
                android.graphics.Insets i = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
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
                    view.loadUrl("file:///android_asset/offline.html");
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (url != null && url.startsWith("https://")) offline = false;
            }
        });
        web.setDownloadListener((url, ua, cd, mime, len) -> openOutside(Uri.parse(url)));

        if (saved != null) web.restoreState(saved);
        else web.loadUrl(startUrl(getIntent()));
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
        String sch = u.getScheme();
        if ("file".equals(sch)) return true;
        return "https".equals(sch) && HOST.equals(u.getHost()) && u.getPath() != null && u.getPath().startsWith("/-");
    }

    void openOutside(Uri u) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, u));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "열 수 있는 앱이 없습니다", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onBackPressed() {
        if (offline) { super.onBackPressed(); return; }
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    protected void onPause() { web.onPause(); super.onPause(); }

    /** 사이트에서 부르는 기능: window.DdingjoApp.xxx() */
    class Bridge {
        /** base64 데이터를 '다운로드' 폴더에 저장. 성공하면 저장한 위치, 실패하면 빈 문자열 */
        @JavascriptInterface
        public String saveFile(String b64, String name, String mime) {
            try {
                byte[] data = Base64.decode(b64, Base64.DEFAULT);
                String safe = name.replaceAll("[\\\\/:*?\"<>|]", "_");
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
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(i, "공유"));
            });
        }

        @JavascriptInterface
        public String version() { return BuildConfigCompat.versionName(MainActivity.this); }

        @JavascriptInterface
        public void reload() { runOnUiThread(() -> { offline = false; web.loadUrl(HOME); }); }
    }
}
