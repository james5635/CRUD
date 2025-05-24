#include <QApplication>
#include <QWidget>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QListWidget>
#include <QPushButton>
#include <QLineEdit>
#include <QTextEdit>
#include <QLabel>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QNetworkAccessManager>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QUrl>
#include <QDebug>

class PostManager : public QWidget {
    Q_OBJECT

public:
    PostManager() {
        setWindowTitle("Laravel Posts CRUD");

        auto layout = new QVBoxLayout(this);
        list = new QListWidget(this);
        layout->addWidget(list);

        auto formLayout = new QVBoxLayout;
        titleEdit = new QLineEdit;
        contentEdit = new QTextEdit;
        formLayout->addWidget(new QLabel("Title"));
        formLayout->addWidget(titleEdit);
        formLayout->addWidget(new QLabel("Content"));
        formLayout->addWidget(contentEdit);
        layout->addLayout(formLayout);

        auto btnLayout = new QHBoxLayout;
        createBtn = new QPushButton("Create");
        updateBtn = new QPushButton("Update");
        deleteBtn = new QPushButton("Delete");
        btnLayout->addWidget(createBtn);
        btnLayout->addWidget(updateBtn);
        btnLayout->addWidget(deleteBtn);
        layout->addLayout(btnLayout);

        network = new QNetworkAccessManager(this);

        connect(createBtn, &QPushButton::clicked, this, &PostManager::createPost);
        connect(updateBtn, &QPushButton::clicked, this, &PostManager::updatePost);
        connect(deleteBtn, &QPushButton::clicked, this, &PostManager::deletePost);
        connect(list, &QListWidget::itemClicked, this, &PostManager::selectPost);

        loadPosts();
    }

private slots:
    void loadPosts() {
        QNetworkRequest req{QUrl(API_URL)};
        auto reply = network->get(req);
        connect(reply, &QNetworkReply::finished, [=]() {
            auto data = reply->readAll();
            reply->deleteLater();

            QJsonDocument doc = QJsonDocument::fromJson(data);
            posts = doc.array();
            list->clear();

            for (const auto& item : posts) {
                QJsonObject obj = item.toObject();
                list->addItem(QString("[%1] %2").arg(obj["id"].toInt()).arg(obj["title"].toString()));
            }
        });
    }

    void createPost() {
        QJsonObject obj;
        obj["title"] = titleEdit->text();
        obj["content"] = contentEdit->toPlainText();

        QNetworkRequest req{QUrl(API_URL)};
        req.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
        auto reply = network->post(req, QJsonDocument(obj).toJson());
        connect(reply, &QNetworkReply::finished, this, &PostManager::loadPosts);
    }

    void updatePost() {
        if (selectedId == -1) return;

        QJsonObject obj;
        obj["title"] = titleEdit->text();
        obj["content"] = contentEdit->toPlainText();

        QNetworkRequest request(QUrl(API_URL + "/" + QString::number(selectedId)));
        request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
        auto reply = network->put(request, QJsonDocument(obj).toJson());
        connect(reply, &QNetworkReply::finished, this, &PostManager::loadPosts);
    }

    void deletePost() {
        if (selectedId == -1) return;

        QNetworkRequest request(QUrl(API_URL + "/" + QString::number(selectedId)));
        auto reply = network->deleteResource(request);
        connect(reply, &QNetworkReply::finished, this, &PostManager::loadPosts);
    }

    void selectPost(QListWidgetItem* item) {
        QString text = item->text();
        int id = text.section("]", 0, 0).remove("[").toInt();
        selectedId = id;

        for (const auto& item : posts) {
            auto obj = item.toObject();
            if (obj["id"].toInt() == id) {
                titleEdit->setText(obj["title"].toString());
                contentEdit->setText(obj["content"].toString());
                break;
            }
        }
    }

private:
    const QString API_URL = "http://localhost:8000/api/posts";

    QListWidget* list;
    QLineEdit* titleEdit;
    QTextEdit* contentEdit;
    QPushButton* createBtn;
    QPushButton* updateBtn;
    QPushButton* deleteBtn;

    QNetworkAccessManager* network;
    QJsonArray posts;
    int selectedId = -1;
};

#include "main.moc"

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    PostManager w;
    w.show();
    return app.exec();
}
