// =========================================================
// 页面配置
// =========================================================

const pageConfig = {
    "text-tool": {
        html: "html/text_tool.html",
        init: "initTextTool"
    },

    "timestamp": {
        html: "html/timestamp.html",
        init: "initTimestampTool"
    },

    "curl-batch": {
        html: "html/curl_batch.html",
        init: "initCurlBatchTool"
    },

    "header-tool": {
        html: "html/header_tool.html",
        init: "initHeaderTool"
    },

    "json-sum": {
        html: "html/json_sum.html",
        init: "initJsonSumTool"
    }
};


// =========================================================
// 页面标题
// =========================================================

const titleMap = {
    "home": "首页",
    "text-tool": "文本处理",
    "timestamp": "时间戳转换",
    "curl-batch": "接口批量请求",
    "header-tool": "Header 转 JSON",
    "json-sum": "JSON 字段统计"
};


// =========================================================
// 已加载页面记录
// =========================================================

const loadedPages = {};


// =========================================================
// 显示页面
// =========================================================

async function showPage(pageName) {

    // 隐藏所有页面
    document.querySelectorAll(".page").forEach(function (page) {
        page.classList.add("hidden");
    });

    // 取消所有菜单 active
    document.querySelectorAll(".menu-item").forEach(function (item) {
        item.classList.remove("active");
    });


    // 当前菜单 active
    const targetMenu = document.querySelector(
        '[data-page="' + pageName + '"]'
    );

    if (targetMenu) {
        targetMenu.classList.add("active");
    }


    // 修改顶部标题
    updateTopbarTitle(pageName);


    // 首页直接显示
    if (pageName === "home") {

        const homePage = document.getElementById("page-home");

        if (homePage) {
            homePage.classList.remove("hidden");
        }

        return;
    }


    // 获取页面配置
    const config = pageConfig[pageName];

    if (!config) {
        console.error("没有找到页面配置：", pageName);
        return;
    }


    // 找到页面容器
    const targetPage = document.getElementById(
        "page-" + pageName
    );

    if (!targetPage) {
        console.error(
            "没有找到页面容器：",
            "page-" + pageName
        );
        return;
    }


    // =====================================================
    // 页面还没有加载
    // =====================================================

    if (!loadedPages[pageName]) {

        targetPage.innerHTML = `
            <div style="
                padding: 40px;
                text-align: center;
                color: #6b7280;
            ">
                正在加载...
            </div>
        `;

        try {

            const response = await fetch(config.html);

            if (!response.ok) {
                throw new Error(
                    "HTTP " + response.status
                );
            }

            const html = await response.text();

            targetPage.innerHTML = html;

            // 标记已经加载
            loadedPages[pageName] = true;


            // =================================================
            // 初始化工具
            // =================================================

            if (
                config.init &&
                typeof window[config.init] === "function"
            ) {
                window[config.init]();
            } else {
                console.warn(
                    "没有找到初始化函数：",
                    config.init
                );
            }

        } catch (error) {

            console.error(
                "加载页面失败：",
                pageName,
                error
            );

            targetPage.innerHTML = `
                <div style="
                    padding: 40px;
                    text-align: center;
                    color: #dc2626;
                    background: #ffffff;
                    border: 1px solid #fee2e2;
                    border-radius: 10px;
                ">
                    <div style="
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 10px;
                    ">
                        页面加载失败
                    </div>

                    <div style="
                        font-size: 13px;
                        color: #6b7280;
                    ">
                        ${error.message}
                    </div>
                </div>
            `;

            return;
        }
    }


    // 显示当前页面
    targetPage.classList.remove("hidden");
}


// =========================================================
// 更新顶部标题
// =========================================================

function updateTopbarTitle(pageName) {

    const titleElement =
        document.querySelector(".topbar-title");

    if (!titleElement) {
        return;
    }

    titleElement.textContent =
        titleMap[pageName] || "QA Tool";
}


// =========================================================
// 初始化左侧菜单
// =========================================================

function initSidebarMenu() {

    const menuItems =
        document.querySelectorAll(".menu-item");

    menuItems.forEach(function (item) {

        item.addEventListener("click", function () {

            const pageName =
                this.dataset.page;

            if (!pageName) {
                return;
            }

            showPage(pageName);
        });

    });
}


// =========================================================
// 初始化首页工具卡片
// =========================================================

function initToolCards() {

    const toolCards =
        document.querySelectorAll(".tool-card");

    toolCards.forEach(function (card) {

        card.addEventListener("click", function () {

            const pageName =
                this.dataset.page;

            if (!pageName) {
                return;
            }

            showPage(pageName);
        });

    });
}


// =========================================================
// 初始化
// =========================================================

function initCommon() {

    initSidebarMenu();

    initToolCards();

    showPage("home");
}


// =========================================================
// 页面加载完成
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initCommon();

    }
);