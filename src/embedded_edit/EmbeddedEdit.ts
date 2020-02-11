import { EmbeddedType } from '../data/EmbeddedType';

interface IEmbeddedEditBindings {
    [key: string]: any;

    embed_type: any;
    embed_uri: any;
    onChange: any;
    ngDisabled: any;
}

const EmbeddedEditBindings: IEmbeddedEditBindings = {
    embed_type: '=?pipEmbeddedType',
    embed_uri: '=?pipEmbeddedUri',
    onChange: '=pipChanged',
    ngDisabled: '&?ngDisabled'
}

class EmbeddedEditChanges implements ng.IOnChangesObject, IEmbeddedEditBindings {
    [key: string]: ng.IChangesObject<any>;

    embed_type: ng.IChangesObject<string>;
    embed_uri: ng.IChangesObject<string>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
    onChange: ng.IChangesObject<() => ng.IPromise<void>>;
}

// class EmbeddeObj {
//     public embed_type: string;
//     public embed_uri: string;
// }

class EmbeddedEditController implements ng.IController {          public $onInit() {}
    public form: any;
    public touchedErrorsWithHint: Function;

    public embed_type: string;
    public embed_uri: string;
    // public onChange: (params: EmbeddeObj) => void;
    public onChange: (embedType: string, embedUri: string) => void;
    public ngDisabled: () => boolean;

    public embeddedTypeCollection = [
        { title: 'EMBEDDED_TYPE_CUSTOM', shortTitle: 'EMBEDDED_TYPE_CUSTOM_SHORT',id: EmbeddedType.Custom },
        { title: 'EMBEDDED_TYPE_YOUTUBE', shortTitle: 'EMBEDDED_TYPE_YOUTUBE_SHORT',id: EmbeddedType.Youtube }
    ];

    constructor(
        private $element: JQuery,
        private $scope: ng.IScope,
        private $state: ng.ui.IStateService,
        public pipMedia: pip.layouts.IMediaService
    ) {
        $element.addClass('pip-embedded-edit');

        this.init();
    }

    public $onChanges(changes: EmbeddedEditChanges): void {
        console.log('$onChanges');
        this.init();
    }

    public $postLink() {
        console.log('postlink', this.$scope)
        this.form = this.$scope.embedded;
    }

    private init(): void {
        if (!this.embed_type) {
            this.embed_type = EmbeddedType.Custom;
        }
    }

    public onChangeType(): void {
        console.log('onChangeType');
        if (!this.form.url.$error)
            this.onChange(this.embed_type, this.embed_uri);
    }

    public onChangeUrl(): void {
        console.log('onChangeUrl');
        this.onChange(this.embed_type, this.embed_uri);
    }

    public isDisabled() {
        if (this.ngDisabled) {
            return this.ngDisabled();
        }

        return false;
    };
}

(() => {

    function declaredEmbeddedEditResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            EMBEDDED_TYPE_LABEL: 'Embedded type',
            EMBEDDED_URL_LABEL: 'Embedded uri',
            EMBEDDED_TYPE_HINT: 'Enter uri of embedded resource',
            EMBEDDED_URL_ERROR: 'Uri error',
            EMBEDDED_TYPE_CUSTOM: 'Custom',
            EMBEDDED_TYPE_YOUTUBE: 'Youtube',
            EMBEDDED_TYPE_CUSTOM_SHORT: 'Custom',
            EMBEDDED_TYPE_YOUTUBE_SHORT: 'Youtube'
        });
        pipTranslateProvider.translations('ru', {
            EMBEDDED_TYPE_LABEL: 'Тип встроенного ресурса',
            EMBEDDED_URL_LABEL: 'Uri встроенного ресурса',
            EMBEDDED_TYPE_HINT: 'Введите uri встроенного ресурса',
            EMBEDDED_URL_ERROR: 'Неверный uri',
            EMBEDDED_TYPE_CUSTOM: 'Другой',
            EMBEDDED_TYPE_YOUTUBE: 'Youtube',
            EMBEDDED_TYPE_CUSTOM_SHORT: 'Другой',
            EMBEDDED_TYPE_YOUTUBE_SHORT: 'Youtube'
        });
    }

    angular
        .module('pipEmbeddedEdit', [])
        .component('pipEmbeddedEdit', {
            bindings: EmbeddedEditBindings,
            templateUrl: 'embedded_edit/EmbeddedEdit.html',
            controller: EmbeddedEditController,
            controllerAs: '$ctrl'
        })
        .config(declaredEmbeddedEditResources);
})();
