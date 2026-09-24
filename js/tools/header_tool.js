(function () {

    let initialized = false;


    // =====================================================
    // 初始化
    // =====================================================

    function initHeaderTool() {

        if (initialized) {
            return;
        }


        const input =
            document.getElementById(
                "headerToolInput"
            );


        if (!input) {
            return;
        }


        initialized = true;


        const output =
            document.getElementById(
                "headerToolOutput"
            );

        const convertButton =
            document.getElementById(
                "convertHeaderButton"
            );

        const formatButton =
            document.getElementById(
                "formatHeaderButton"
            );

        const clearButton =
            document.getElementById(
                "clearHeaderButton"
            );

        const copyButton =
            document.getElementById(
                "copyHeaderJsonButton"
            );

        const resultCard =
            document.getElementById(
                "headerToolResultCard"
            );

        const message =
            document.getElementById(
                "headerToolMessage"
            );

        const headerCount =
            document.getElementById(
                "headerCount"
            );

        const headerCharCount =
            document.getElementById(
                "headerCharCount"
            );


        // =================================================
        // 消息
        // =================================================

        function showMessage(
            text,
            type
        ) {

            message.textContent =
                text || "";

            message.className =
                "header-tool-message";


            if (type) {
                message.classList.add(type);
            }
        }


        // =================================================
        // Header 转 JSON
        // =================================================

        function parseHeaders(text) {

            const headers = {};


            const lines =
                text
                    .replace(/\r\n/g, "\n")
                    .split("\n");


            lines.forEach(
                function (line) {

                    line = line.trim();


                    // 空行忽略
                    if (!line) {
                        return;
                    }


                    /*
                     * 找第一个冒号。
                     *
                     * 不使用 split(":")
                     * 避免：
                     *
                     * Authorization:
                     * http://xxx
                     *
                     * 被错误拆分。
                     */

                    const index =
                        line.indexOf(":");


                    if (index === -1) {
                        return;
                    }


                    const name =
                        line
                            .substring(
                                0,
                                index
                            )
                            .trim();


                    const value =
                        line
                            .substring(
                                index + 1
                            )
                            .trim();


                    if (!name) {
                        return;
                    }


                    /*
                     * 如果 Header 重复，
                     * 后面的值覆盖前面的值。
                     */

                    headers[name] =
                        value;

                }
            );


            return headers;
        }


        // =================================================
        // 转换
        // =================================================

        function convertHeader() {

            const text =
                input.value.trim();


            if (!text) {

                showMessage(
                    "请输入 Header 内容",
                    "error"
                );

                resultCard.classList.add(
                    "hidden"
                );

                return;
            }


            const headers =
                parseHeaders(text);


            const keys =
                Object.keys(headers);


            if (!keys.length) {

                showMessage(
                    "未解析到有效 Header，请检查格式",
                    "error"
                );

                resultCard.classList.add(
                    "hidden"
                );

                return;
            }


            const json =
                JSON.stringify(
                    headers,
                    null,
                    4
                );


            output.value =
                json;


            headerCount.textContent =
                keys.length;


            headerCharCount.textContent =
                json.length;


            resultCard.classList.remove(
                "hidden"
            );


            showMessage(
                `转换成功，共 ${keys.length} 个 Header`,
                "success"
            );
        }


        // =================================================
        // 格式化 JSON
        // =================================================

        function formatJson() {

            const text =
                output.value.trim();


            if (!text) {

                showMessage(
                    "暂无 JSON 内容",
                    "error"
                );

                return;
            }


            try {

                const json =
                    JSON.parse(text);


                const formatted =
                    JSON.stringify(
                        json,
                        null,
                        4
                    );


                output.value =
                    formatted;


                headerCharCount.textContent =
                    formatted.length;


                showMessage(
                    "JSON 格式化成功",
                    "success"
                );

            } catch (error) {

                showMessage(
                    "JSON 格式错误",
                    "error"
                );
            }
        }


        // =================================================
        // 复制
        // =================================================

        async function copyResult() {

            const text =
                output.value;


            if (!text) {

                showMessage(
                    "暂无可复制内容",
                    "error"
                );

                return;
            }


            try {

                await navigator.clipboard.writeText(
                    text
                );


                showMessage(
                    "JSON 已复制",
                    "success"
                );

            } catch (error) {

                // 兼容旧浏览器
                output.select();

                document.execCommand(
                    "copy"
                );


                showMessage(
                    "JSON 已复制",
                    "success"
                );
            }
        }


        // =================================================
        // 清空
        // =================================================

        function clearAll() {

            input.value = "";

            output.value = "";


            headerCount.textContent =
                "0";

            headerCharCount.textContent =
                "0";


            resultCard.classList.add(
                "hidden"
            );


            showMessage("");
        }


        // =================================================
        // 事件
        // =================================================

        convertButton.addEventListener(
            "click",
            convertHeader
        );


        formatButton.addEventListener(
            "click",
            formatJson
        );


        clearButton.addEventListener(
            "click",
            clearAll
        );


        copyButton.addEventListener(
            "click",
            copyResult
        );


        // Ctrl + Enter 转换
        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.ctrlKey &&
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    convertHeader();
                }

            }
        );

    }


    // =====================================================
    // 暴露给 common.js
    // =====================================================

    window.initHeaderTool =
        initHeaderTool;


})();