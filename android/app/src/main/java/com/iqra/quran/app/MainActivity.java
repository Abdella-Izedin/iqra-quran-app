package com.iqra.quran.app;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.graphics.Insets;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // On Android 15 (SDK 35+), edge-to-edge is enforced and cannot be disabled.
        // We must manually apply system bar insets as padding to the root content view
        // so the WebView content doesn't render behind the status bar or navigation bar.
        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, windowInsets) -> {
                Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
                // Apply padding equal to system bar sizes so content stays between them
                v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
                return WindowInsetsCompat.CONSUMED;
            });
        }
    }
}
