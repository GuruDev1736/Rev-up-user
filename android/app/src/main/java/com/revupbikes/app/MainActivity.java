package com.revupbikes.app;

import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.view.ViewGroup;
import android.webkit.WebBackForwardList;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.OnBackPressedCallback;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.getcapacitor.BridgeActivity;
import com.ionicframework.capacitor.Checkout;

public class MainActivity extends BridgeActivity {

    // File extensions that should open in the DocumentViewerActivity
    private static final String[] DOCUMENT_EXTENSIONS = {
            ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg"
    };

    /**
     * Check if a URL points to a document file (PDF, image, etc.)
     */
    private boolean isDocumentUrl(String url) {
        if (url == null) return false;
        String lowerUrl = url.toLowerCase().split("\\?")[0]; // Remove query params
        for (String ext : DOCUMENT_EXTENSIONS) {
            if (lowerUrl.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extract a human-readable title from a document URL.
     */
    private String getTitleFromUrl(String url) {
        try {
            String path = Uri.parse(url).getLastPathSegment();
            if (path != null && !path.isEmpty()) {
                // Clean up the filename
                return path.replaceAll("[_-]", " ")
                        .replaceAll("\\.[^.]+$", "") // remove extension
                        .trim();
            }
        } catch (Exception ignored) {
        }
        return "Document";
    }

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

        // Enable support for window.open() — required to intercept _blank targets
        webView.getSettings().setSupportMultipleWindows(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);

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

        // Keep all navigation inside the WebView + intercept document URLs
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String url = uri.toString();
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

                // Intercept document URLs — open in DocumentViewerActivity
                if (isDocumentUrl(url)) {
                    DocumentViewerActivity.open(
                            MainActivity.this, url, getTitleFromUrl(url));
                    return true;
                }

                // All other http/https URLs load inside the WebView
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (swipeRefreshLayout.isRefreshing()) {
                    swipeRefreshLayout.setRefreshing(false);
                }
            }
        });

        // Intercept window.open() calls (used by the website for _blank document links)
        // This catches: window.open(docUrl, "_blank") and <a target="_blank">
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog,
                                          boolean isUserGesture, Message resultMsg) {
                // Get the URL that was being opened
                WebView.HitTestResult hitTestResult = view.getHitTestResult();
                String url = hitTestResult.getExtra();

                if (url != null && isDocumentUrl(url)) {
                    // Document URL — open in DocumentViewerActivity
                    DocumentViewerActivity.open(
                            MainActivity.this, url, getTitleFromUrl(url));
                    return false; // Don't create a new window
                }

                // For non-document URLs opened with window.open/_blank,
                // create a temporary WebView to extract the URL, then
                // load it in our main WebView (or open in document viewer)
                WebView tempWebView = new WebView(MainActivity.this);
                tempWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                        String newUrl = request.getUrl().toString();

                        if (isDocumentUrl(newUrl)) {
                            DocumentViewerActivity.open(
                                    MainActivity.this, newUrl, getTitleFromUrl(newUrl));
                        } else {
                            // Load in the main WebView instead of opening a new window
                            webView.loadUrl(newUrl);
                        }

                        // Clean up the temp WebView
                        tempWebView.destroy();
                        return true;
                    }
                });

                WebView.WebViewTransport transport =
                        (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(tempWebView);
                resultMsg.sendToTarget();
                return true;
            }

            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
            }
        });
    }
}