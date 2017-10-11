import React, { Component } from 'react';
import {
    Text,
    TextInput,
    View,
    TouchableWithoutFeedback,
    TouchableOpacity,
    FlatList,
    UIManager,
    LayoutAnimation,
} from 'react-native';

import {
    Ionicons,
    MaterialIcons,
} from '@expo/vector-icons';

import PropTypes from 'prop-types';
import reject from 'lodash/reject';
import find from 'lodash/find';
// import { InputGroup, Input, Icon } from 'native-base';
// import IconMd from 'react-native-vector-icons/MaterialIcons';

// set UIManager LayoutAnimationEnabledExperimental
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

import styles, { colorPack } from './styles';

export default class MultiSelect extends Component {
    static propTypes = {
        single: PropTypes.bool,
        selectedItems: PropTypes.array,
        items: PropTypes.array.isRequired,
        uniqueKey: PropTypes.string,
        tagBorderColor: PropTypes.string,
        tagTextColor: PropTypes.string,
        fontFamily: PropTypes.string,
        tagRemoveIconColor: PropTypes.string,
        onSelectedItemsChange: PropTypes.func.isRequired,
        selectedItemFontFamily: PropTypes.string,
        selectedItemTextColor: PropTypes.string,
        itemFontFamily: PropTypes.string,
        itemTextColor: PropTypes.string,
        selectedItemIconColor: PropTypes.string,
        searchInputPlaceholderText: PropTypes.string,
        searchInputStyle: PropTypes.object,
        selectText: PropTypes.string,
        altFontFamily: PropTypes.string,
        submitButtonColor: PropTypes.string,
        submitButtonText: PropTypes.string,
        textColor: PropTypes.string,
        fontSize: PropTypes.number,
        fixedHeight: PropTypes.bool,
    };

    static defaultProps = {
        single: false,
        selectedItems: [],
        items: [],
        uniqueKey: '_id',
        tagBorderColor: colorPack.primary,
        tagTextColor: colorPack.primary,
        fontFamily: '',
        tagRemoveIconColor: colorPack.danger,
        onSelectedItemsChange: () => {
        },
        selectedItemFontFamily: '',
        selectedItemTextColor: colorPack.primary,
        itemFontFamily: '',
        itemTextColor: colorPack.textPrimary,
        selectedItemIconColor: colorPack.primary,
        searchInputPlaceholderText: 'Search',
        searchInputStyle: {color: colorPack.textPrimary},
        textColor: colorPack.textPrimary,
        selectText: 'Select',
        altFontFamily: '',
        submitButtonColor: '#CCC',
        submitButtonText: 'Submit',
        fontSize: 14,
        fixedHeight: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            selector: false,
            searchTerm: '',
            selectedItems: this.props.selectedItems,
            items: this.props.items,
        };
    }

    _getSelectLabel = () => {
        const {selectText, single} = this.props;
        const {selectedItems} = this.state;
        if (!selectedItems || selectedItems.length === 0) {
            return selectText;
        } else if (single) {
            const item = selectedItems[0];
            return item.title;
        }
        return `${selectText} (${selectedItems.length} selected)`;
    };

    _displaySelectedItems = () => {
        const {
            fontFamily,
            tagRemoveIconColor,
            tagBorderColor,
            uniqueKey,
            tagTextColor,
        } = this.props;
        const {selectedItems} = this.state;
        return [...selectedItems].map(item => (
            <View
                style={[
                    styles.selectedItem,
                    {
                        width: item.title.length * 8 + 70,
                        justifyContent: 'center',
                        height: 40,
                        borderColor: tagBorderColor,
                        marginTop: 20,
                    },
                ]}
                key={item[uniqueKey]}
            >
                <Text
                    style={[
                        {
                            flex: 1,
                            color: tagTextColor,
                            fontSize: 15,
                            backgroundColor: 'rgba(0,0,0,0)',
                        },
                        fontFamily ? {fontFamily} : {},
                    ]}
                >
                    {item.title}
                </Text>
                <TouchableOpacity onPress={() => {
                    this._removeItem(item);
                }}>
                    <MaterialIcons
                        name="cancel"
                        style={{
                            color: tagRemoveIconColor,
                            fontSize: 22,
                            marginLeft: 10,
                            backgroundColor: 'rgba(0,0,0,0)',
                        }}
                    />
                </TouchableOpacity>
            </View>
        ));
    };

    _removeItem = (item) => {
        const {uniqueKey, onSelectedItemsChange} = this.props;
        const {selectedItems} = this.state;
        const newItems = reject([...selectedItems], singleItem => (
            item[uniqueKey] === singleItem[uniqueKey]
        ));
        this.setState({
            selectedItems: newItems,
        });
        // broadcast new selected items state to parent component
        onSelectedItemsChange(newItems);
    };

    _removeAllItems = () => {
        const {onSelectedItemsChange} = this.props;
        this.setState({
            selectedItems: [],
        });
        onSelectedItemsChange([]);
    };

    _toggleSelector = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            selector: !this.state.selector,
        });
    };

    _submitSelection = () => {
        const {onSelectedItemsChange} = this.props;
        this._toggleSelector();
        // reset searchTerm
        // this.setState({ searchTerm: '' });
        // broadcast selected items state to parent component
        onSelectedItemsChange([...this.state.selectedItems]);
    };

    _itemSelected = (item) => {
        const {uniqueKey} = this.props;
        return (
            !!find(this.state.selectedItems, singleItem => (
                item[uniqueKey] === singleItem[uniqueKey]
            ))
        );
    }

    _toggleItem = (item) => {
        const {single, uniqueKey, onSelectedItemsChange} = this.props;
        if (single) {
            this.setState({
                selectedItems: [item],
            }, this._submitSelection);
        } else {
            const selectedItems = [...this.state.selectedItems];
            const status = this._itemSelected(item);
            let newItems = [];
            if (status) {
                newItems = reject(selectedItems, singleItem => (
                    item[uniqueKey] === singleItem[uniqueKey]
                ));
            } else {
                selectedItems.push(item);
            }
            this.setState({
                selectedItems: status ? newItems : selectedItems,
            }, this._submitSelection);
            //this._toggleSelector();

        }
    };

    _itemStyle = (item) => {
        const {
            selectedItemFontFamily,
            selectedItemTextColor,
            itemFontFamily,
            itemTextColor,
        } = this.props;
        const isSelected = this._itemSelected(item);
        const fontFamily = {};
        if (isSelected && selectedItemFontFamily) {
            fontFamily.fontFamily = selectedItemFontFamily;
        } else if (!isSelected && itemFontFamily) {
            fontFamily.fontFamily = itemFontFamily;
        }
        const color = isSelected ? {color: selectedItemTextColor} : {color: itemTextColor};
        return {
            ...fontFamily,
            ...color,
        };
    };

    _getRow = (item) => {
        const {selectedItemIconColor} = this.props;
        return (
            <TouchableOpacity
                onPress={() => this._toggleItem(item)}
                style={{paddingLeft: 20, paddingRight: 20}}
            >
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                            style={[
                                {
                                    flex: 1,
                                    fontSize: 16,
                                    paddingTop: 5,
                                    paddingBottom: 5,
                                },
                                this._itemStyle(item),
                            ]}
                        >
                            {item.title}
                        </Text>
                        {
                            this._itemSelected(item) ?
                                <MaterialIcons
                                    name="check"
                                    style={{
                                        fontSize: 20,
                                        color: selectedItemIconColor,
                                    }}
                                /> :
                                null
                        }
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    _filterItems = (searchTerm) => {
        if (searchTerm.length >= 2) {
            const items = [...this.state.items];
            const filteredItems = [];
            items.forEach((item) => {
                const parts = searchTerm.trim().split(/[ \-:]+/);
                const regex = new RegExp(`(${parts.join('|')})`, 'ig');
                if (regex.test(item.title)) {
                    filteredItems.push(item);
                }
            });
            return filteredItems;
        }
    };

    _renderItems = () => {
        const {fontFamily, uniqueKey} = this.props;
        const {selectedItems} = this.state;
        let items;
        let component = null;
        const searchTerm = this.state.searchTerm.trim();
        if (searchTerm.length >= 2) {
            items = this._filterItems(searchTerm);
            if (items.length) {
                component = (
                    <FlatList
                        data={items}
                        extraData={selectedItems}
                        keyExtractor={item => item[uniqueKey]}
                        renderItem={rowData => this._getRow(rowData.item)}
                    />
                );
            } else {
                component = (
                    <View
                        style={{flexDirection: 'row', alignItems: 'center'}}
                    >
                        <Text
                            style={[
                                {
                                    flex: 1,
                                    marginTop: 20,
                                    textAlign: 'center',
                                    color: colorPack.danger,
                                },
                                fontFamily ? {fontFamily} : {},
                            ]}
                        >
                            No item to display.
                        </Text>
                    </View>
                );
            }
        } else {
            items = this.state.items;
        }

        return component;
    };

    render() {
        const {
            single,
            fontFamily,
            altFontFamily,
            searchInputPlaceholderText,
            searchInputStyle,
            submitButtonColor,
            submitButtonText,
            fontSize,
            textColor,
            fixedHeight,
        } = this.props;

        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    marginBottom: 10,
                }}
            >
                {
                    this.state.selector
                        ?
                        <View style={styles.selectorView(fixedHeight)}>
                            <View
                                style={{
                                    paddingLeft: 16,
                                    backgroundColor: colorPack.light,
                                    flexDirection: 'row',
                                    padding: 10,
                                    flex: 1,
                                }}
                            >
                                <Ionicons
                                    name="ios-search"
                                    style={{fontSize: 30, color: colorPack.placeholderTextColor, alignItems: 'center'}}
                                />
                                <TextInput
                                    autoFocus
                                    onChangeText={searchTerm => this.setState({searchTerm})}
                                    placeholder={searchInputPlaceholderText}
                                    placeholderTextColor={colorPack.placeholderTextColor}
                                    style={[searchInputStyle, {marginLeft: 15, width: '70%'}]}
                                />
                                <TouchableOpacity
                                    onPress={() => this._toggleSelector()}
                                    style={{justifyContent: 'flex-end', marginLeft: 30, marginRight: 20}}
                                >
                                    <Ionicons
                                        name="ios-close"
                                        style={{fontSize: 30, color: colorPack.placeholderTextColor}}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'column',
                                    backgroundColor: '#fafafa',
                                }}
                            >
                                {
                                    this.state.searchTerm.length ?
                                        <View>
                                            {this._renderItems()}
                                        </View>
                                        :
                                        null

                                }

                                {
                                    /*!single &&
                                    this.state.searchTerm.length ?
                                      <TouchableOpacity
                                        onPress={() => this._submitSelection()}
                                        style={[styles.button, { backgroundColor: submitButtonColor }]}
                                      >
                                        <Text
                                          style={[styles.buttonText, fontFamily ? { fontFamily } : {}]}
                                        >
                                          {submitButtonText}
                                        </Text>
                                      </TouchableOpacity>
                                      :
                                      null
                                      */
                                }
                            </View>
                            {
                                (!single && this.state.selectedItems.length) ?
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {this._displaySelectedItems()}
                                    </View>
                                    :
                                    null
                            }
                        </View>
                        :
                        <View>
                            <View style={styles.dropdownView}>
                                <View style={[styles.subSection, {paddingTop: 10, paddingBottom: 10}]}>
                                    <TouchableWithoutFeedback onPress={this._toggleSelector}>
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                            <Text
                                                style={[
                                                    {
                                                        flex: 1,
                                                        fontSize: fontSize || 16,
                                                        color:  textColor || colorPack.placeholderTextColor,
                                                    },
                                                    altFontFamily ? { fontFamily: altFontFamily } : fontFamily ? { fontFamily } : {},
                                                ]}
                                            >
                                                {this._getSelectLabel()}
                                            </Text>
                                            <MaterialIcons
                                                name="arrow-drop-down"
                                                style={styles.indicator}
                                            />
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </View>
                            {
                                (!single && this.state.selectedItems.length) ?
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {this._displaySelectedItems()}
                                    </View>
                                    :
                                    null
                            }
                        </View>
                }
            </View>
        );
    }
}
