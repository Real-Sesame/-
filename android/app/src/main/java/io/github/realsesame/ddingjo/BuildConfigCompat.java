package io.github.realsesame.ddingjo;

import android.content.Context;
import android.content.pm.PackageInfo;

/** 설치된 앱 버전 읽기(BuildConfig를 쓰지 않아 빌드 설정이 단순함) */
final class BuildConfigCompat {
    static String versionName(Context c) {
        try { return c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionName; } catch (Exception e) { return "0"; }
    }
    @SuppressWarnings("deprecation")
    static long versionCode(Context c) {
        try {
            PackageInfo p = c.getPackageManager().getPackageInfo(c.getPackageName(), 0);
            return android.os.Build.VERSION.SDK_INT >= 28 ? p.getLongVersionCode() : p.versionCode;
        } catch (Exception e) { return 0; }
    }
}
