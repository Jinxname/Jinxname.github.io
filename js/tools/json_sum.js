(function () {

    let initialized = false;

    let jsonData = [];

    let numericFields = [];


    // =====================================================
    // 初始化
    // =====================================================

    function initJsonSumTool() {

        if (initialized) {
            return;
        }


        const input =
            document.getElementById(
                "jsonSumInput"
            );


        if (!input) {
            return;
        }


        initialized = true;


        const parseButton =
            document.getElementById(
                "parseJsonSumButton"
            );

        const formatButton =
            document.getElementById(
                "formatJsonSumButton"
            );

        const clearButton =
            document.getElementById(
                "clearJsonSumButton"
            );

        const fieldCard =
            document.getElementById(
                "jsonSumFieldCard"
            );

        const resultCard =
            document.getElementById(
                "jsonSumResultCard"
            );

        const fieldList =
            document.getElementById(
                "jsonSumFieldList"
            );

        const dataCount =
            document.getElementById(
                "jsonSumDataCount"
            );

        const selectedCount =
            document.getElementById(
                "jsonSumSelectedCount"
            );

        const selectAllButton =
            document.getElementById(
                "selectAllJsonSumButton"
            );

        const unselectAllButton =
            document.getElementById(
                "unselectAllJsonSumButton"
            );

        const calculateButton =
            document.getElementById(
                "calculateJsonSumButton"
            );

        const resultTableBody =
            document.getElementById(
                "jsonSumResultTableBody"
            );

        const resultText =
            document.getElementById(
                "jsonSumResultText"
            );

        const copyButton =
            document.getElementById(
                "copyJsonSumResultButton"
            );

        const message =
            document.getElementById(
                "jsonSumMessage"
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
                "json-sum-message";


            if (type) {
                message.classList.add(type);
            }
        }


        // =================================================
        // 判断数字
        // =================================================

        function isNumber(value) {

            return (
                typeof value === "number" &&
                Number.isFinite(value)
            );
        }


        // =================================================
        // 获取数字字段
        // =================================================

        function getNumericFields(data) {

            const fieldSet =
                new Set();


            data.forEach(
                function (item) {

                    if (
                        !item ||
                        typeof item !== "object" ||
                        Array.isArray(item)
                    ) {
                        return;
                    }


                    Object.keys(item).forEach(
                        function (key) {

                            if (
                                isNumber(
                                    item[key]
                                )
                            ) {

                                fieldSet.add(
                                    key
                                );

                            }

                        }
                    );

                }
            );


            return Array.from(
                fieldSet
            ).sort(
                function (a, b) {

                    return a.localeCompare(
                        b,
                        "zh-CN",
                        {
                            numeric: true
                        }
                    );

                }
            );
        }


        // =================================================
        // 解析 JSON
        // =================================================

        function parseJson() {

            const text =
                input.value.trim();


            if (!text) {

                showMessage(
                    "请输入 JSON 数据",
                    "error"
                );

                return;
            }


            let parsed;


            try {

                parsed =
                    JSON.parse(text);

            } catch (error) {

                showMessage(
                    "JSON 格式错误，请检查输入内容",
                    "error"
                );

                fieldCard.classList.add(
                    "hidden"
                );

                resultCard.classList.add(
                    "hidden"
                );

                return;
            }


            if (!Array.isArray(parsed)) {

                showMessage(
                    "当前仅支持 JSON 数组格式",
                    "error"
                );

                fieldCard.classList.add(
                    "hidden"
                );

                resultCard.classList.add(
                    "hidden"
                );

                return;
            }


            if (!parsed.length) {

                showMessage(
                    "JSON 数组为空",
                    "error"
                );

                fieldCard.classList.add(
                    "hidden"
                );

                resultCard.classList.add(
                    "hidden"
                );

                return;
            }


            jsonData =
                parsed;


            numericFields =
                getNumericFields(
                    jsonData
                );


            dataCount.textContent =
                jsonData.length;


            if (!numericFields.length) {

                fieldCard.classList.add(
                    "hidden"
                );

                resultCard.classList.add(
                    "hidden"
                );

                showMessage(
                    "未找到数字类型字段",
                    "error"
                );

                return;
            }


            renderFields();


            fieldCard.classList.remove(
                "hidden"
            );

            resultCard.classList.add(
                "hidden"
            );


            showMessage(
                `解析成功，共 ${jsonData.length} 条数据，找到 ${numericFields.length} 个数字字段`,
                "success"
            );

        }


        // =================================================
        // 渲染字段
        // =================================================

        function renderFields() {

            fieldList.innerHTML = "";


            numericFields.forEach(
                function (field) {

                    const item =
                        document.createElement(
                            "label"
                        );

                    item.className =
                        "json-sum-field-item";


                    const checkbox =
                        document.createElement(
                            "input"
                        );

                    checkbox.type =
                        "checkbox";

                    checkbox.value =
                        field;


                    const name =
                        document.createElement(
                            "span"
                        );

                    name.className =
                        "json-sum-field-name";

                    name.textContent =
                        field;


                    const type =
                        document.createElement(
                            "span"
                        );

                    type.className =
                        "json-sum-field-type";

                    type.textContent =
                        "Number";


                    item.appendChild(
                        checkbox
                    );

                    item.appendChild(
                        name
                    );

                    item.appendChild(
                        type
                    );


                    checkbox.addEventListener(
                        "change",
                        function () {

                            item.classList.toggle(
                                "checked",
                                checkbox.checked
                            );

                            updateSelectedCount();

                        }
                    );


                    fieldList.appendChild(
                        item
                    );

                }
            );


            updateSelectedCount();
        }


        // =================================================
        // 获取选中的字段
        // =================================================

        function getSelectedFields() {

            const checkboxes =
                fieldList.querySelectorAll(
                    'input[type="checkbox"]:checked'
                );


            return Array.from(
                checkboxes
            ).map(
                function (checkbox) {
                    return checkbox.value;
                }
            );
        }


        // =================================================
        // 更新选择数量
        // =================================================

        function updateSelectedCount() {

            const count =
                getSelectedFields().length;


            selectedCount.textContent =
                count;
        }


        // =================================================
        // 全选
        // =================================================

        function selectAll() {

            const checkboxes =
                fieldList.querySelectorAll(
                    'input[type="checkbox"]'
                );


            checkboxes.forEach(
                function (checkbox) {

                    checkbox.checked =
                        true;


                    const item =
                        checkbox.closest(
                            ".json-sum-field-item"
                        );


                    if (item) {
                        item.classList.add(
                            "checked"
                        );
                    }

                }
            );


            updateSelectedCount();
        }


        // =================================================
        // 取消全选
        // =================================================

        function unselectAll() {

            const checkboxes =
                fieldList.querySelectorAll(
                    'input[type="checkbox"]'
                );


            checkboxes.forEach(
                function (checkbox) {

                    checkbox.checked =
                        false;


                    const item =
                        checkbox.closest(
                            ".json-sum-field-item"
                        );


                    if (item) {
                        item.classList.remove(
                            "checked"
                        );
                    }

                }
            );


            updateSelectedCount();
        }


        // =================================================
        // 格式化数字
        // =================================================

        function formatNumber(value) {

            if (
                Number.isInteger(value)
            ) {
                return String(value);
            }


            return String(
                Number(
                    value.toFixed(12)
                )
            );
        }


        // =================================================
        // 计算总和
        // =================================================

        function calculateSum() {

            const fields =
                getSelectedFields();


            if (!fields.length) {

                showMessage(
                    "请至少选择一个字段",
                    "error"
                );

                return;
            }


            const results = [];


            fields.forEach(
                function (field) {

                    let total = 0;


                    jsonData.forEach(
                        function (item) {

                            const value =
                                item[field];


                            if (
                                isNumber(value)
                            ) {

                                total += value;

                            }

                        }
                    );


                    results.push({
                        field: field,
                        total: total
                    });

                }
            );


            renderResults(
                results
            );


            resultCard.classList.remove(
                "hidden"
            );


            showMessage(
                `统计完成，共计算 ${fields.length} 个字段`,
                "success"
            );

        }


        // =================================================
        // 渲染结果
        // =================================================

        function renderResults(
            results
        ) {

            resultTableBody.innerHTML =
                "";


            const textLines = [];


            results.forEach(
                function (result) {

                    const tr =
                        document.createElement(
                            "tr"
                        );


                    const fieldTd =
                        document.createElement(
                            "td"
                        );

                    fieldTd.textContent =
                        result.field;


                    const valueTd =
                        document.createElement(
                            "td"
                        );

                    valueTd.textContent =
                        formatNumber(
                            result.total
                        );


                    tr.appendChild(
                        fieldTd
                    );

                    tr.appendChild(
                        valueTd
                    );


                    resultTableBody.appendChild(
                        tr
                    );


                    textLines.push(
                        result.field +
                        ": " +
                        formatNumber(
                            result.total
                        )
                    );

                }
            );


            resultText.value =
                textLines.join("\n");
        }


        // =================================================
        // 格式化 JSON
        // =================================================

        function formatJson() {

            const text =
                input.value.trim();


            if (!text) {

                showMessage(
                    "请输入 JSON 数据",
                    "error"
                );

                return;
            }


            try {

                const parsed =
                    JSON.parse(text);


                input.value =
                    JSON.stringify(
                        parsed,
                        null,
                        4
                    );


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
        // 复制结果
        // =================================================

        async function copyResult() {

            const text =
                resultText.value;


            if (!text) {

                showMessage(
                    "暂无统计结果",
                    "error"
                );

                return;
            }


            try {

                await navigator.clipboard.writeText(
                    text
                );


                showMessage(
                    "统计结果已复制",
                    "success"
                );

            } catch (error) {

                resultText.select();

                document.execCommand(
                    "copy"
                );


                showMessage(
                    "统计结果已复制",
                    "success"
                );
            }
        }


        // =================================================
        // 清空
        // =================================================

        function clearAll() {

            input.value = "";

            jsonData = [];

            numericFields = [];

            fieldList.innerHTML = "";

            resultTableBody.innerHTML = "";

            resultText.value = "";

            dataCount.textContent =
                "0";

            selectedCount.textContent =
                "0";


            fieldCard.classList.add(
                "hidden"
            );

            resultCard.classList.add(
                "hidden"
            );


            showMessage("");
        }


        // =================================================
        // 事件绑定
        // =================================================

        parseButton.addEventListener(
            "click",
            parseJson
        );


        formatButton.addEventListener(
            "click",
            formatJson
        );


        clearButton.addEventListener(
            "click",
            clearAll
        );


        selectAllButton.addEventListener(
            "click",
            selectAll
        );


        unselectAllButton.addEventListener(
            "click",
            unselectAll
        );


        calculateButton.addEventListener(
            "click",
            calculateSum
        );


        copyButton.addEventListener(
            "click",
            copyResult
        );


        // Ctrl + Enter 解析
        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.ctrlKey &&
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    parseJson();
                }

            }
        );

    }


    // =====================================================
    // 暴露给 common.js
    // =====================================================

    window.initJsonSumTool =
        initJsonSumTool;


})();