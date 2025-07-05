#include <gtk/gtk.h>
#include <curl/curl.h>
#include <json-glib/json-glib.h>
#include <string.h>

// API Base URL
const char *API_URL = "http://localhost:5086/items";

// UI Elements
GtkWidget *window;
GtkWidget *list_box;
GtkWidget *entry;

// Memory struct for curl
struct MemoryStruct {
    char *memory;
    size_t size;
};

// Function declarations
static void on_activate(GtkApplication *app, gpointer user_data);
static void fetch_items();
static void add_item(GtkWidget *widget, gpointer data);
static void delete_item_clicked(GtkWidget *widget, gpointer data);
static void update_item_clicked(GtkWidget *widget, gpointer data);
static size_t WriteMemoryCallback(void *contents, size_t size, size_t nmemb, void *userp);
static void apply_css();

// Main
int main(int argc, char **argv) {
    GtkApplication *app;
    int status;

    curl_global_init(CURL_GLOBAL_ALL);

    app = gtk_application_new("com.example.gtkcrud", G_APPLICATION_FLAGS_NONE);
    apply_css(); // Apply CSS styling
    g_signal_connect(app, "activate", G_CALLBACK(on_activate), NULL);
    status = g_application_run(G_APPLICATION(app), argc, argv);
    g_object_unref(app);

    curl_global_cleanup();
    return status;
}

// CSS Styling
static void apply_css() {
    GtkCssProvider *provider = gtk_css_provider_new();
    gtk_css_provider_load_from_data(provider,
        "entry, button {\n"
        "  padding: 8px;\n"
        "  border-radius: 6px;\n"
        "  font-size: 14px;\n"
        "}\n"
        "button {\n"
        "  background: linear-gradient(90deg, #2196F3, #21CBF3);\n"
        "  color: white;\n"
        "  font-weight: bold;\n"
        "  border: none;\n"
        "}\n"
        "button:hover {\n"
        "  background: #1976D2;\n"
        "}\n"
        "list box row {\n"
        "  padding: 10px;\n"
        "  border-bottom: 1px solid #ccc;\n"
        "}\n"
        "label {\n"
        "  font-size: 14px;\n"
        "  color: #333;\n"
        "}\n",
        -1);

    gtk_style_context_add_provider_for_display(
        gdk_display_get_default(),
        GTK_STYLE_PROVIDER(provider),
        GTK_STYLE_PROVIDER_PRIORITY_USER
    );
}

// CURL write callback
static size_t WriteMemoryCallback(void *contents, size_t size, size_t nmemb, void *userp) {
    size_t realsize = size * nmemb;
    struct MemoryStruct *mem = (struct MemoryStruct *)userp;

    char *ptr = realloc(mem->memory, mem->size + realsize + 1);
    if (ptr == NULL) {
        printf("Not enough memory\n");
        return 0;
    }

    mem->memory = ptr;
    memcpy(&(mem->memory[mem->size]), contents, realsize);
    mem->size += realsize;
    mem->memory[mem->size] = 0;
    return realsize;
}

// GTK activate
static void on_activate(GtkApplication *app, gpointer user_data) {
    GtkWidget *main_box;
    GtkWidget *input_box;
    GtkWidget *add_button;
    GtkWidget *scrolled_window;

    window = gtk_application_window_new(app);
    gtk_window_set_title(GTK_WINDOW(window), "GTK CRUD App");
    gtk_window_set_default_size(GTK_WINDOW(window), 400, 600);
    gtk_window_set_resizable(GTK_WINDOW(window), FALSE);

    main_box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 10);
    gtk_widget_set_margin_top(main_box, 20);
    gtk_widget_set_margin_bottom(main_box, 20);
    gtk_widget_set_margin_start(main_box, 20);
    gtk_widget_set_margin_end(main_box, 20);
    gtk_window_set_child(GTK_WINDOW(window), main_box);

    input_box = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 5);
    gtk_box_append(GTK_BOX(main_box), input_box);

    entry = gtk_entry_new();
    gtk_widget_set_hexpand(entry, TRUE);
    gtk_box_append(GTK_BOX(input_box), entry);

    add_button = gtk_button_new_with_label("Add");
    g_signal_connect(add_button, "clicked", G_CALLBACK(add_item), NULL);
    gtk_box_append(GTK_BOX(input_box), add_button);

    scrolled_window = gtk_scrolled_window_new();
    gtk_widget_set_vexpand(scrolled_window, TRUE);
    gtk_box_append(GTK_BOX(main_box), scrolled_window);

    list_box = gtk_list_box_new();
    gtk_list_box_set_selection_mode(GTK_LIST_BOX(list_box), GTK_SELECTION_NONE);
    gtk_scrolled_window_set_child(GTK_SCROLLED_WINDOW(scrolled_window), list_box);

    fetch_items();
    gtk_widget_show(window);
}

// Fetch items
static void fetch_items() {
    GtkWidget *child = gtk_widget_get_first_child(list_box);
    while (child != NULL) {
        GtkWidget *next = gtk_widget_get_next_sibling(child);
        gtk_list_box_remove(GTK_LIST_BOX(list_box), child);
        child = next;
    }

    CURL *curl;
    CURLcode res;
    struct MemoryStruct chunk;
    chunk.memory = malloc(1);
    chunk.size = 0;

    curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, API_URL);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteMemoryCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&chunk);
        res = curl_easy_perform(curl);

        if (res == CURLE_OK) {
            JsonParser *parser = json_parser_new();
            GError *error = NULL;
            json_parser_load_from_data(parser, chunk.memory, -1, &error);

            if (!error) {
                JsonNode *root = json_parser_get_root(parser);
                JsonArray *array = json_node_get_array(root);
                guint len = json_array_get_length(array);

                for (guint i = 0; i < len; i++) {
                    JsonObject *obj = json_array_get_object_element(array, i);
                    const char *name = json_object_get_string_member(obj, "name");
                    int id = json_object_get_int_member(obj, "id");

                    GtkWidget *row = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 10);
                    gtk_widget_set_margin_top(row, 5);
                    gtk_widget_set_margin_bottom(row, 5);
                    gtk_widget_set_margin_start(row, 10);
                    gtk_widget_set_margin_end(row, 10);

                    GtkWidget *label = gtk_label_new(name);
                    gtk_widget_set_hexpand(label, TRUE);
                    gtk_label_set_xalign(GTK_LABEL(label), 0);

                    GtkWidget *update_button = gtk_button_new_with_label("✏️");
                    GtkWidget *delete_button = gtk_button_new_with_label("❌");

                    g_signal_connect(update_button, "clicked", G_CALLBACK(update_item_clicked), GINT_TO_POINTER(id));
                    g_signal_connect(delete_button, "clicked", G_CALLBACK(delete_item_clicked), GINT_TO_POINTER(id));

                    gtk_box_append(GTK_BOX(row), label);
                    gtk_box_append(GTK_BOX(row), update_button);
                    gtk_box_append(GTK_BOX(row), delete_button);

                    gtk_list_box_insert(GTK_LIST_BOX(list_box), row, -1);
                }
            }
            g_object_unref(parser);
        }
        curl_easy_cleanup(curl);
    }
    free(chunk.memory);
}

// Add item
static void add_item(GtkWidget *widget, gpointer data) {
    const char *name = gtk_editable_get_text(GTK_EDITABLE(entry));
    if (strlen(name) == 0) return;

    CURL *curl;
    CURLcode res;
    struct curl_slist *headers = NULL;
    char post_fields[256];

    sprintf(post_fields, "{\"name\": \"%s\"}", name);

    curl = curl_easy_init();
    if (curl) {
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_URL, API_URL);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post_fields);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        res = curl_easy_perform(curl);
        if (res == CURLE_OK) {
            fetch_items();
            gtk_editable_set_text(GTK_EDITABLE(entry), "");
        }
        curl_easy_cleanup(curl);
    }
}

// Update item
static void update_item_clicked(GtkWidget *widget, gpointer data) {
    int id = GPOINTER_TO_INT(data);
    const char *name = gtk_editable_get_text(GTK_EDITABLE(entry));
    if (strlen(name) == 0) return;

    CURL *curl;
    CURLcode res;
    struct curl_slist *headers = NULL;
    char url[256];
    char put_fields[256];

    sprintf(url, "%s/%d", API_URL, id);
    sprintf(put_fields, "{\"id\": %d, \"name\": \"%s\"}", id, name);

    curl = curl_easy_init();
    if (curl) {
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, put_fields);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        res = curl_easy_perform(curl);
        if (res == CURLE_OK) {
            fetch_items();
            gtk_editable_set_text(GTK_EDITABLE(entry), "");
        }
        curl_easy_cleanup(curl);
    }
}

// Delete item
static void delete_item_clicked(GtkWidget *widget, gpointer data) {
    int id = GPOINTER_TO_INT(data);
    CURL *curl;
    CURLcode res;
    char url[256];

    sprintf(url, "%s/%d", API_URL, id);

    curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "DELETE");

        res = curl_easy_perform(curl);
        if (res == CURLE_OK) {
            fetch_items();
        }
        curl_easy_cleanup(curl);
    }
}
