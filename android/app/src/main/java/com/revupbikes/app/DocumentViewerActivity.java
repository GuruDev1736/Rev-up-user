package com.revupbikes.app;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageButton;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

/**
 * A full-screen activity that displays documents (PDFs, images, invoices, etc.)
 * inside a WebView using Google Docs Viewer for PDFs or direct rendering for images.
 * Provides a toolbar with back, download, and share options.
 */
public class DocumentViewerActivity extends AppCompatActivity {

    public static final String EXTRA_URL = "document_url";
    public static final String EXTRA_TITLE = "document_title";

    private WebView documentWebView;
    private ProgressBar progressBar;
    private TextView titleText;
    private String documentUrl;
    private String documentTitle;

    /**
     * Helper to launch DocumentViewerActivity from anywhere.
     */
    public static void open(Context context, String url, String title) {
        Intent intent = new Intent(context, DocumentViewerActivity.class);
        intent.putExtra(EXTRA_URL, url);
        intent.putExtra(EXTRA_TITLE, title != null ? title : "Document");
        context.startActivity(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_document_viewer);

        documentUrl = getIntent().getStringExtra(EXTRA_URL);
        documentTitle = getIntent().getStringExtra(EXTRA_TITLE);

        if (documentUrl == null || documentUrl.isEmpty()) {
            Toast.makeText(this, "No document URL provided", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        // Bind views
        documentWebView = findViewById(R.id.documentWebView);
        progressBar = findViewById(R.id.documentProgressBar);
        titleText = findViewById(R.id.documentTitle);
        ImageButton btnBack = findViewById(R.id.btnBack);
        ImageButton btnDownload = findViewById(R.id.btnDownload);
        ImageButton btnShare = findViewById(R.id.btnShare);

        // Set title
        if (documentTitle != null && !documentTitle.isEmpty()) {
            titleText.setText(documentTitle);
        }

        // Back button
        btnBack.setOnClickListener(v -> finish());

        // Download button
        btnDownload.setOnClickListener(v -> downloadDocument());

        // Share button
        btnShare.setOnClickListener(v -> shareDocument());

        // Configure WebView
        setupWebView();

        // Load the document
        loadDocument();
    }

    private void setupWebView() {
        documentWebView.getSettings().setJavaScriptEnabled(true);
        documentWebView.getSettings().setBuiltInZoomControls(true);
        documentWebView.getSettings().setDisplayZoomControls(false);
        documentWebView.getSettings().setLoadWithOverviewMode(true);
        documentWebView.getSettings().setUseWideViewPort(true);
        documentWebView.getSettings().setDomStorageEnabled(true);
        documentWebView.getSettings().setAllowFileAccess(true);
        documentWebView.getSettings().setSupportZoom(true);

        documentWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // Keep all navigation inside this WebView
                view.loadUrl(request.getUrl().toString());
                return true;
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                // If Google Docs Viewer fails, try loading the URL directly
                if (failingUrl != null && failingUrl.contains("docs.google.com")) {
                    view.loadUrl(documentUrl);
                }
            }
        });

        documentWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                progressBar.setProgress(newProgress);
                if (newProgress == 100) {
                    progressBar.setVisibility(View.GONE);
                }
            }
        });
    }

    private void loadDocument() {
        String lowerUrl = documentUrl.toLowerCase();

        if (lowerUrl.endsWith(".pdf")) {
            // Use Google Docs Viewer for PDFs
            String googleDocsUrl = "https://docs.google.com/gview?embedded=true&url="
                    + Uri.encode(documentUrl);
            documentWebView.loadUrl(googleDocsUrl);
        } else if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")
                || lowerUrl.endsWith(".png") || lowerUrl.endsWith(".webp")
                || lowerUrl.endsWith(".gif")) {
            // Display images directly with fit-to-width HTML wrapper
            String html = "<!DOCTYPE html><html><head>"
                    + "<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'>"
                    + "<style>"
                    + "* { margin: 0; padding: 0; box-sizing: border-box; }"
                    + "body { background: #1a1a1a; display: flex; align-items: center; justify-content: center; min-height: 100vh; }"
                    + "img { max-width: 100%; height: auto; display: block; }"
                    + "</style>"
                    + "</head><body>"
                    + "<img src='" + documentUrl + "' alt='Document' />"
                    + "</body></html>";
            documentWebView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
        } else {
            // For other file types, try Google Docs Viewer first
            String googleDocsUrl = "https://docs.google.com/gview?embedded=true&url="
                    + Uri.encode(documentUrl);
            documentWebView.loadUrl(googleDocsUrl);
        }
    }

    private void downloadDocument() {
        try {
            // Determine filename from URL
            String fileName = documentTitle != null ? documentTitle.replaceAll("[^a-zA-Z0-9._-]", "_") : "document";
            String lowerUrl = documentUrl.toLowerCase();

            if (lowerUrl.endsWith(".pdf")) {
                fileName += ".pdf";
            } else if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) {
                fileName += ".jpg";
            } else if (lowerUrl.endsWith(".png")) {
                fileName += ".png";
            } else if (lowerUrl.endsWith(".webp")) {
                fileName += ".webp";
            } else {
                // Extract extension from URL
                String path = Uri.parse(documentUrl).getLastPathSegment();
                if (path != null && path.contains(".")) {
                    fileName += path.substring(path.lastIndexOf("."));
                } else {
                    fileName += ".pdf";
                }
            }

            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(documentUrl));
            request.setTitle(documentTitle != null ? documentTitle : "Document Download");
            request.setDescription("Downloading document...");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

            DownloadManager downloadManager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (downloadManager != null) {
                downloadManager.enqueue(request);
                Toast.makeText(this, "Download started. Check your notifications.", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Toast.makeText(this, "Failed to start download: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void shareDocument() {
        try {
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, documentTitle != null ? documentTitle : "Document");
            shareIntent.putExtra(Intent.EXTRA_TEXT, documentUrl);
            startActivity(Intent.createChooser(shareIntent, "Share Document"));
        } catch (Exception e) {
            Toast.makeText(this, "Failed to share document", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onBackPressed() {
        if (documentWebView.canGoBack()) {
            documentWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
