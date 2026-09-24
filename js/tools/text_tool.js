(function () {

    "use strict";


    // ============================================================
    // DOM
    // ============================================================

    let inputElement;
    let outputElement;

    let inputLineCountElement;
    let inputCharCountElement;

    let resultLineCountElement;
    let resultCharCountElement;

    let messageElement;


    // ============================================================
    // 初始化
    // ============================================================

    function initTextTool() {

        inputElement =
            document.getElementById("textToolInput");

        outputElement =
            document.getElementById("textToolOutput");

        inputLineCountElement =
            document.getElementById("textInputLineCount");

        inputCharCountElement =
            document.getElementById("textInputCharCount");

        resultLineCountElement =
            document.getElementById("textResultLineCount");

        resultCharCountElement =
            document.getElementById("textResultCharCount");

        messageElement =
            document.getElementById("textToolMessage");


        if (!inputElement) {
            return;
        }


        bindEvents();

        updateInputStats();

        updateResultStats();

    }


    // ============================================================
    // 事件
    // ============================================================

    function bindEvents() {

        inputElement.addEventListener(
            "input",
            function () {

                updateInputStats();

                clearMessage();

            }
        );


        bindClick(
            "removeEmptyLinesButton",
            removeEmptyLines
        );

        bindClick(
            "trimLinesButton",
            trimLines
        );

        bindClick(
            "removeDuplicateButton",
            removeDuplicateLines
        );

        bindClick(
            "removeExtraSpacesButton",
            removeExtraSpaces
        );

        bindClick(
            "sortAscButton",
            sortAscending
        );

        bindClick(
            "sortDescButton",
            sortDescending
        );

        bindClick(
            "copyTextResultButton",
            copyResult
        );

        bindClick(
            "clearTextButton",
            clearAll
        );

    }


    function bindClick(id, callback) {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        element.addEventListener(
            "click",
            callback
        );

    }


    // ============================================================
    // 获取输入文本
    // ============================================================

    function getInputText() {

        if (!inputElement) {
            return "";
        }

        return inputElement.value || "";

    }


    // ============================================================
    // 获取文本行
    // ============================================================

    function getLines() {

        const text =
            getInputText();

        if (!text) {
            return [];
        }

        return text.split(/\r?\n/);

    }


    // ============================================================
    // 设置结果
    // ============================================================

    function setResult(text) {

        if (!outputElement) {
            return;
        }

        outputElement.value = text;

        updateResultStats();

    }


    // ============================================================
    // 去除空行
    // ============================================================

    function removeEmptyLines() {

        const lines =
            getLines();

        if (lines.length === 0) {

            showMessage(
                "请输入文本内容",
                "error"
            );

            return;
        }


        const result =
            lines.filter(function (line) {

                return line.trim() !== "";

            });


        setResult(
            result.join("\n")
        );


        showMessage(
            "已去除空行",
            "success"
        );

    }


    // ============================================================
    // 去除首尾空格
    // ============================================================

    function trimLines() {

        const lines =
            getLines();

        if (lines.length === 0) {

            showMessage(
                "请输入文本内容",
                "error"
            );

            return;
        }


        const result =
            lines.map(function (line) {

                return line.trim();

            });


        setResult(
            result.join("\n")
        );


        showMessage(
            "已去除每行首尾空格",
            "success"
        );

    }


    // ============================================================
    // 去除重复行
    // ============================================================

    function removeDuplicateLines() {

        const lines =
            getLines();

        if (lines.length === 0) {

            showMessage(
                "请输入文本内容",
                "error"
            );

            return;
        }


        const seen =
            new Set();

        const result = [];


        lines.forEach(function (line) {

            /*
             * 使用 trim 后的内容作为
             * 重复判断依据。
             *
             * 但保留第一次出现的
             * 原始文本内容。
             */

            const key =
                line.trim();


            if (!seen.has(key)) {

                seen.add(key);

                result.push(line);

            }

        });


        setResult(
            result.join("\n")
        );


        showMessage(
            "已去除重复行",
            "success"
        );

    }


    // ============================================================
    // 合并多余空格
    // ============================================================

    function removeExtraSpaces() {

        const lines =
            getLines();

        if (lines.length === 0) {

            showMessage(
                "请输入文本内容",
                "error"
            );

            return;
        }


        const result =
            lines.map(function (line) {

                return line
                    .replace(/[ \t]+/g, " ")
                    .trim();

            });


        setResult(
            result.join("\n")
        );


        showMessage(
            "已合并多余空格",
            "success"
        );

    }


    // ============================================================
    // 升序排序
    // ============================================================

    function sortAscending() {

        const lines =
            getLines();

        if (lines.length === 0) {

            showMessage(
                "请输入文本内容",
                "error"
            );

            return;
        }


        lines.sort(function (a, b) {

            return a.localeCompare(
                b,
                "zh-CN",
                {
                    numeric: true,
                    sensitivity: "base"
                }
            );

        });


        setResult(
            lines.join("\n")
        );


        showMessage(
            "已按升序排序",
            "success"
        );

    }


    // ============================================================
    // 降序排序
    // ============================================================

    function sortDescending() {

        const lines =
            getLines();

        if (lines.length === 0) {

            showMessage(
                "请输入文本内容",
                "error"
            );

            return;
        }


        lines.sort(function (a, b) {

            return b.localeCompare(
                a,
                "zh-CN",
                {
                    numeric: true,
                    sensitivity: "base"
                }
            );

        });


        setResult(
            lines.join("\n")
        );


        showMessage(
            "已按降序排序",
            "success"
        );

    }


    // ============================================================
    // 输入统计
    // ============================================================

    function updateInputStats() {

        const text =
            getInputText();

        const lines =
            text
                ? text.split(/\r?\n/)
                : [];


        if (inputLineCountElement) {

            inputLineCountElement.textContent =
                lines.length;

        }


        if (inputCharCountElement) {

            inputCharCountElement.textContent =
                text.length;

        }

    }


    // ============================================================
    // 结果统计
    // ============================================================

    function updateResultStats() {

        if (!outputElement) {
            return;
        }


        const text =
            outputElement.value || "";


        const lines =
            text
                ? text.split(/\r?\n/)
                : [];


        if (resultLineCountElement) {

            resultLineCountElement.textContent =
                lines.length;

        }


        if (resultCharCountElement) {

            resultCharCountElement.textContent =
                text.length;

        }

    }


    // ============================================================
    // 复制
    // ============================================================

    async function copyResult() {

        if (!outputElement) {
            return;
        }


        const text =
            outputElement.value || "";


        if (!text) {

            showMessage(
                "暂无可复制的结果",
                "error"
            );

            return;
        }


        try {

            await navigator.clipboard.writeText(
                text
            );

            showMessage(
                "复制成功",
                "success"
            );

        } catch (error) {

            fallbackCopy(text);

        }

    }


    // ============================================================
    // 兼容复制
    // ============================================================

    function fallbackCopy(text) {

        const textarea =
            document.createElement("textarea");


        textarea.value =
            text;


        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        try {

            const success =
                document.execCommand("copy");


            if (success) {

                showMessage(
                    "复制成功",
                    "success"
                );

            } else {

                showMessage(
                    "复制失败，请手动复制",
                    "error"
                );

            }

        } catch (error) {

            showMessage(
                "复制失败，请手动复制",
                "error"
            );

        }


        document.body.removeChild(
            textarea
        );

    }


    // ============================================================
    // 清空
    // ============================================================

    function clearAll() {

        if (inputElement) {
            inputElement.value = "";
        }

        if (outputElement) {
            outputElement.value = "";
        }


        updateInputStats();

        updateResultStats();

        clearMessage();

    }


    // ============================================================
    // 消息
    // ============================================================

    function showMessage(text, type) {

        if (!messageElement) {
            return;
        }


        messageElement.textContent =
            text;


        messageElement.className =
            "text-tool-message";


        if (type) {

            messageElement.classList.add(
                type
            );

        }

    }


    function clearMessage() {

        if (!messageElement) {
            return;
        }


        messageElement.textContent =
            "";

        messageElement.className =
            "text-tool-message";

    }


    // ============================================================
    // 暴露初始化方法
    // ============================================================

    window.initTextTool =
        initTextTool;


    // 如果 HTML 是直接加载的，
    // 自动初始化
    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initTextTool
        );

    } else {

        initTextTool();

    }


})();