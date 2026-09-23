package com.revupbikes.app;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.webkit.WebBackForwardList;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.OnBackPressedCallback;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.getcapacitor.BridgeActivity;
import com.ionicframework.capacitor.Checkout;

public class MainActivity extends BridgeActivity {

    /**
     * Check if a URL is a "real" app page that the user should be able to
     * navigate back to. Returns false for external domains (DigiLocker, etc.)
     * and for callback/redirect pages that are part of OAuth flows.
     */
    private boolean isNavigableAppUrl(String url) {
        if (url == null) return false;
        try {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();

            // Must be on our app domain
            if (host == null || !host.contains("revupbikes.com")) {
                return false;
            }

            // Must not be an OAuth callback or redirect page
            String path = uri.getPath();
            if (path != null) {
                if (path.contains("/digilocker/callback")
                        || path.contains("/api/digilocker/authorize")
                        || path.contains("/api/digilocker/auth-url")) {
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(Checkout.class);
        super.onCreate(savedInstanceState);

        // Get Capacitor's actual WebView (not the layout placeholder)
        WebView webView = getBridge().getWebView();
        ViewGroup parent = (ViewGroup) webView.getParent();
        int index = parent.indexOfChild(webView);

        // Remove WebView from its current parent
        parent.removeView(webView);

        // Create SwipeRefreshLayout programmatically and add WebView into it
        SwipeRefreshLayout swipeRefreshLayout = new SwipeRefreshLayout(this);
        swipeRefreshLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        swipeRefreshLayout.addView(webView, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // Insert SwipeRefreshLayout back into the parent at the same position
        parent.addView(swipeRefreshLayout, index, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        Handler handler = new Handler(Looper.getMainLooper());

        // Set up pull-to-refresh: reload the WebView and poll for completion
        swipeRefreshLayout.setOnRefreshListener(() -> {
            webView.reload();

            Runnable checkProgress = new Runnable() {
                @Override
                public void run() {
                    if (webView.getProgress() == 100) {
                        swipeRefreshLayout.setRefreshing(false);
                    } else {
                        handler.postDelayed(this, 100);
                    }
                }
            };
            handler.postDelayed(checkProgress, 500);

            // Safety timeout
            handler.postDelayed(() -> swipeRefreshLayout.setRefreshing(false), 10000);
        });

        // Only allow pull-to-refresh when the WebView is scrolled to the very top
        swipeRefreshLayout.setOnChildScrollUpCallback((parentView, child) -> webView.getScrollY() > 0);

        // Handle back button with smart history inspection
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    WebBackForwardList history = webView.copyBackForwardList();
                    int currentIndex = history.getCurrentIndex();

                    // Scan backwards to find the nearest real app page
                    for (int i = currentIndex - 1; i >= 0; i--) {
                        String prevUrl = history.getItemAtIndex(i).getUrl();
                        if (isNavigableAppUrl(prevUrl)) {
                            // Found a valid page — go back the required number of steps
                            int steps = currentIndex - i;
                            webView.goBackOrForward(-steps);
                            return;
                        }
                    }
                }

                // No navigable history entry found — show exit dialog
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("Exit Application")
                        .setMessage("Do you want to exit the application?")
                        .setPositiveButton("Yes", (dialog, which) -> finish())
                        .setNegativeButton("No", (dialog, which) -> dialog.dismiss())
                        .setCancelable(false)
                        .show();
            }
        });

        // Keep all navigation inside the WebView (DigiLocker OAuth, callbacks, etc.)
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();

                // Let non-http schemes (tel:, mailto:, intent:) open externally
                if (scheme != null && !scheme.equals("http") && !scheme.equals("https")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(intent);
                    } catch (Exception ignored) {
                    }
                    return true;
                }

                // All http/https URLs load inside the WebView
                view.loadUrl(uri.toString());
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Dismiss swipe-refresh spinner if active
                if (swipeRefreshLayout.isRefreshing()) {
                    swipeRefreshLayout.setRefreshing(false);
                }
            }
        });
    }
}